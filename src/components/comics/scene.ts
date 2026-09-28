import { gsap } from "gsap";
import * as THREE from "three";
import type { Comic } from "@/lib/comics";
import { createTurnPage } from "@/components/comics/page-turn";
import {
  coverTexture,
  headingFontFamily,
  loadCoverTexture,
  paintUpcomingSpine,
  pickTextureWidth,
} from "@/components/comics/textures";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { readingBack } from "@/components/comics/framing";
import {
  renderPixelRatio,
  renderedPixels,
  shadowMapSize,
} from "@/components/comics/render-budget";
import { buildSpreads, clampSpreadIndex, presentSpread, type Spread } from "@/lib/reading";

const BOOK = { w: 1.02, h: 1.5, t: 0.26 };
/** Largeur:hauteur de la face de tranche (spineGeo) - voir coverTexture dans textures.ts. */
const SPINE_FACE_ASPECT = BOOK.t / BOOK.h;
const COVER_T = 0.022;
const HOVER_OUT = 0.09;
/**
 * Écart (au-delà du contact tranche/couverture) entre le livre désigné et
 * son premier voisin de chaque côté - le seul vrai vide de la composition,
 * pour distinguer sa couverture, large (BOOK.w), de la tranche fine
 * (BOOK.t) qui la longe. Au-delà de ce premier voisin, les suivants restent
 * tranche à tranche (voir NEXT_NEIGHBOR_GAP) : c'est le premier voisin, pas
 * eux, qui absorbe tout l'écart ouvert par la désignation.
 */
const FIRST_NEIGHBOR_GAP = 0.16;
/**
 * Écart entre deux voisins non désignés, l'un contre l'autre - un simple
 * filet (pas une vraie séparation) plutôt qu'un vide, pour qu'ils lisent
 * comme des livres serrés sur une étagère, non comme des cases espacées.
 */
const NEXT_NEIGHBOR_GAP = 0.015;

/**
 * Abscisse de chaque livre, dans l'ORDRE DU TABLEAU plutôt que relative au
 * livre désigné : chaque livre garde sa place dans l'alignement d'une
 * désignation à l'autre, seule sa largeur change (BOOK.w, couverture, s'il
 * est désigné - BOOK.t, tranche, sinon). La largeur totale de la
 * composition (une couverture + le reste en tranches + les écarts) ne
 * dépend donc pas de l'index désigné : ses bords extrêmes, centrés sur
 * `centerX`, ne bougent jamais.
 *
 * Avant cette fonction, le livre désigné était toujours posé à x = 0, les
 * autres en éventail de part et d'autre (le premier de chaque côté à
 * `gaps.first`, large, les suivants à `gaps.next`, tranche contre tranche) :
 * un livre de bord (premier ou dernier du tableau) n'avait alors des voisins
 * que d'un seul côté, et la composition entière - largeur et centre -
 * variait donc selon lequel était désigné et se décalait pendant la
 * transition. Ordonner par index plutôt que par distance au désigné fixe
 * une fois pour toutes la largeur totale (elle ne dépend plus que du nombre
 * de livres, pas de la désignation) : la composition reste donc centrée et
 * immobile pendant la désignation (voir select()), sur desktop comme sur
 * mobile - qui vise en plus des proportions d'écran précises (couverture à
 * MOBILE_COVER_FRACTION de la largeur, voir shelfPositions). `centerX` vaut
 * toujours 0 dans shelfPositions (l'origine du monde, jamais shelfCenterX) :
 * sur desktop la caméra vise elle un point décalé (voir shelfCenterX,
 * SHELF_CENTER_X_DESKTOP) pour laisser la place à la card, posée à droite -
 * recentrer la composition sur ce même point annulerait ce décalage voulu
 * entre elle et ce que regarde la caméra.
 *
 * `gaps.first` s'applique de part et d'autre du livre désigné (sa
 * couverture, large, appelle un vrai vide pour s'en distinguer), `gaps.next`
 * entre deux tranches voisines (un simple filet, pas une séparation - voir
 * FIRST_NEIGHBOR_GAP/NEXT_NEIGHBOR_GAP sur desktop) ; les deux valent la
 * même chose sur mobile (voir shelfPositions), où cette distinction n'a plus
 * lieu d'être.
 */
function indexOrderedPositions(
  count: number,
  selectedIndex: number,
  gaps: { first: number; next: number },
  centerX: number,
): number[] {
  const widths = Array.from({ length: count }, (_, i) => (i === selectedIndex ? BOOK.w : BOOK.t));
  const gapAfter = (i: number) =>
    i === selectedIndex || i + 1 === selectedIndex ? gaps.first : gaps.next;
  let totalWidth = widths.reduce((sum, w) => sum + w, 0);
  for (let i = 0; i < count - 1; i++) totalWidth += gapAfter(i);
  let cursor = centerX - totalWidth / 2;
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    positions.push(cursor + widths[i] / 2);
    cursor += widths[i] + (i < count - 1 ? gapAfter(i) : 0);
  }
  return positions;
}
/**
 * Bond du livre non désigné au survol, ajouté à son repos (SPINE_REST_Z, pas
 * 0 - un bond absolu le ramènerait assez près de la caméra pour réexposer le
 * dessus du bloc de pages, voir SPINE_REST_Z). Même amplitude que HOVER_OUT :
 * un livre encore loin derrière son repos (SPINE_REST_Z ≈ -0.29) peut se le
 * permettre sans jamais paraître aussi engagé que le livre désigné, qui parte
 * déjà de HOVER_OUT (0.09) tout court.
 */
const HOVER_OUT_UNSELECTED = HOVER_OUT;
const SELECT_OUT = 0.9;
/**
 * Profondeur de repos d'un livre non désigné, tranche tournée vers la caméra. La
 * tranche est postée au bord du livre (voir spine.position.x plus bas), pas en son
 * centre : la pivoter à 90° l'avance donc de BOOK.w / 2 - COVER_T / 2 devant l'axe
 * du groupe, presque la moitié de la largeur du livre. Non compensé, ce surplomb
 * plaçait la tranche bien plus près de la caméra que la couverture du livre désigné
 * (avancée seulement de BOOK.t / 2, l'épaisseur), qui en paraissait la plus petite
 * des deux - l'exact inverse de la hiérarchie voulue. Ce repos vise donc la même
 * profondeur que la couverture désignée à son propre repos (HOVER_OUT).
 */
const SPINE_REST_Z = HOVER_OUT + (BOOK.t - BOOK.w) / 2;
/**
 * Décalage (desktop) de la caméra (et de sa cible, pour ne pas l'incliner)
 * au repos de l'étagère : la card d'info occupe la moitié droite du canevas
 * (absolue, voir refreshCardGap dans ShelfShell), qui reste lui pleine
 * largeur de page ; sans ce décalage, une composition centrée sur l'axe
 * optique (comme sur mobile, voir shelfCenterX) se retrouverait à cheval
 * sous la card plutôt que dans l'espace resté libre à sa gauche.
 */
const SHELF_CENTER_X_DESKTOP = 0.55;
/** Distance (desktop) caméra/étagère au repos - voir shelfRestZ. */
const SHELF_REST_Z_DESKTOP = 3.4;
/** FOV (degrés) de la caméra au repos de l'étagère - voir shelfRestZ. */
const SHELF_FOV = 45;
/**
 * En dessous de ce seuil (aligné sur DESKTOP_BREAKPOINT_PX dans ShelfShell),
 * le cadrage (distance caméra), l'écart entre livres et le centrage sont
 * recalculés à partir de la largeur réelle du canevas plutôt que d'utiliser
 * les constantes fixes ci-dessus, pensées pour un canevas large où la card
 * d'info occupe l'espace à droite (voir refreshCardGap dans ShelfShell).
 */
const MOBILE_BREAKPOINT_PX = 768;
/** Écart (mobile) voulu entre deux livres adjacents, en pixels CSS. */
const MOBILE_GAP_PX = 12;
/**
 * Fraction (mobile) de la largeur du canevas - une fois les deux écarts
 * déduits - occupée par la couverture du livre désigné. Un seul facteur de
 * zoom uniforme pour les trois livres (pas une mise à l'échelle indépendante
 * par livre, qui ferait paraître une tranche bien plus haute que la
 * couverture) : les deux tranches se partagent le reste de cette largeur
 * selon leur épaisseur réelle (BOOK.t, très inférieure à BOOK.w - jamais
 * pile un quart chacune), plutôt que d'être forcées à une fraction fixe qui
 * les étirerait hors de leur format propre.
 */
const MOBILE_COVER_FRACTION = 0.5;

function isMobileCanvas(w: number): boolean {
  return w > 0 && w < MOBILE_BREAKPOINT_PX;
}

/**
 * Distance caméra (repos étagère) qui fait tenir MOBILE_COVER_FRACTION de
 * (largeur du canevas - 2 × MOBILE_GAP_PX) dans la largeur en pixels de la
 * couverture désignée, à FOV constant (SHELF_FOV) - voir le commentaire de
 * MOBILE_COVER_FRACTION. `null` hors mobile : SHELF_REST_Z_DESKTOP s'applique
 * alors tel quel.
 */
function mobileRestZ(w: number, h: number): number | null {
  if (!isMobileCanvas(w) || h <= 0) return null;
  const contentPx = Math.max(w - 2 * MOBILE_GAP_PX, 1);
  const coverPx = contentPx * MOBILE_COVER_FRACTION;
  const pxPerWorldUnit = coverPx / BOOK.w;
  const halfFovRad = (SHELF_FOV * Math.PI) / 360;
  return h / 2 / (pxPerWorldUnit * Math.tan(halfFovRad));
}

const OPEN_ANGLE = -2.3;
/**
 * Profondeur du fond assombri posé derrière le livre en lecture (voir
 * readBackdrop plus bas) : entre le repos des livres voisins (SPINE_REST_Z
 * ≈ -0.29, HOVER_OUT_UNSELECTED au plus près) et la double page elle-même
 * (SELECT_OUT = 0.9), pour couvrir l'étagère et la pièce sans jamais mordre
 * sur la page en cours de lecture.
 */
const READ_BACKDROP_Z = 0.35;
/** Hauteur du centre du livre engagé : la lecture cadre sur elle, pas sur BOOK.h / 2. */
const SELECT_Y = BOOK.h / 2 + 0.15;
const READ_FOV = 42;
/**
 * En lecture la couverture se rabat à plat : à OPEN_ANGLE elle penche vers la caméra
 * et masque la moitié gauche de la double page.
 */
const READ_OPEN_ANGLE = -Math.PI;

/**
 * La clé d'étagère est rasante : elle détache des tranches rangées. Sur un livre ouvert,
 * objet symétrique présenté de face, ce décalage latéral se lit aussitôt — une moitié
 * propre, l'autre sale. En lecture elle revient donc sur l'axe du livre, en appoint
 * seulement, et l'ambiante monte pour que les deux planches se lisent pareil.
 */
const KEY_SHELF = new THREE.Vector3(2.6, 3.4, 2.8);
const KEY_READ = new THREE.Vector3(0, 2.4, 3.0);
/**
 * La directionnelle de lecture ne sert qu'à l'ombre, d'où son obliquité : sur l'axe du
 * livre elle plaquait l'ombre de la feuille exactement sous la feuille, donc invisible.
 * Une directionnelle n'a ni cône ni atténuation de distance : deux pages coplanaires en
 * reçoivent rigoureusement le même éclairement, quelle que soit son obliquité.
 */
const READ_LIGHT_POS = new THREE.Vector3(1.4, 2.4, 2.6);
/**
 * Creux d'éclairement au pli, en fraction de l'albédo. Deux pages coplanaires reçoivent
 * le même N·L d'une directionnelle et le même apport d'un environnement : aucun réglage
 * de lumière ne peut creuser la reliure, seule une atténuation portée par le matériau le
 * fait, et elle vaut alors des deux côtés du pli.
 */
const GUTTER_DEPTH = 0.28;
/** Délais successifs de reprise d'une planche qui n'est pas arrivée, en millisecondes. */
const PLATE_RETRY_MS = [400, 1200, 3000];
/**
 * Plafond de pixels réellement rendus. C'est lui qui borne la charge, pas la taille
 * de la fenêtre : au-delà, le rapport de pixels du rendu descend et l'ombre reste.
 * Un écran courant, jusqu'au 2560 × 1440 à un pixel par point, passe sans plafonner.
 */
const PIXEL_BUDGET = 4_000_000;
/** Plancher du rapport de pixels : en dessous, le trait des planches se délite. */
const PIXEL_RATIO_FLOOR = 0.75;
/** Surface rendue au-delà de laquelle la carte d'ombre passe au format inférieur. */
const SHADOW_FULL_PIXELS = 2_400_000;

/**
 * À 0.18 la couverture désignée (blanche, roughness 0.75) restait mate,
 * proche du gris sous la seule flaque du projecteur : l'ambiante remonte
 * pour qu'elle lise franchement blanche, sans toucher le mur (MeshBasicMaterial,
 * non éclairé) ni assez les plats/pages sombres (#101216, #efe7d6 déjà bas)
 * pour rouvrir le livre non désigné qui, lui, reste estompé par sa teinte.
 */
const AMBIENT_SHELF = 0.34;
/** L'environnement porte tout l'éclairement en lecture : l'ambiante ferait doublon. */
const AMBIENT_READ = 0;
const ENV_READ_INTENSITY = 0.5;

export type SceneOptions = {
  reducedMotion: boolean;
  onHoverChange: (index: number | null) => void;
  onPick: (index: number) => void;
  onDismiss: () => void;
  onTurn: (direction: -1 | 1) => void;
};

export type SceneHandle = {
  setHover(index: number | null): void;
  select(index: number, animate: boolean): Promise<void>;
  close(animate: boolean): Promise<void>;
  enterImmediate(index: number): void;
  openForReading(index: number, spread: number, animate: boolean): Promise<void>;
  goToSpread(spread: number, animate: boolean): Promise<void>;
  currentSpread(): number;
  spreadCount(): number;
  setPickingEnabled(enabled: boolean): void;
  setTurningEnabled(enabled: boolean): void;
  setVisible(visible: boolean): void;
  renderOnce(): void;
  resize(): void;
  /** Abscisse, en pixels CSS depuis le bord gauche du canevas, du point le plus à
   *  droite parmi les livres actuellement posés - sert à river la card à un
   *  écart constant plutôt qu'à un point fixe du viewport (voir ShelfShell). */
  contentRightEdge(): number;
  /** Abscisse, en pixels CSS depuis le bord gauche du canevas, du centre de
   *  l'étagère - sert à centrer le curseur (BookSlider) sous les livres,
   *  pas sous la card (voir ShelfShell). */
  contentCenterX(): number;
  /** Ordonnée, en pixels CSS depuis le sommet du canevas, du sommet des livres
   *  (le pire cas des trois désignations, comme contentRightEdge) - sert à
   *  rapprocher tout le bloc canevas de l'en-tête "Pick a story" d'un écart
   *  constant plutôt que de la moitié fixe de l'écran (voir ShelfShell). */
  contentTopY(): number;
  /** Ordonnée, en pixels CSS depuis le sommet du canevas, du pied des livres
   *  (là où ils posent sur l'étagère) - sert à poser le curseur juste sous
   *  eux, pas sous un bord du conteneur qui peut déborder l'écran (voir
   *  ShelfShell). */
  contentBottomY(): number;
  dispose(): void;
};

type BookNode = {
  group: THREE.Group;
  pick: THREE.Mesh;
  coverPivot: THREE.Group;
  spineMaterial: THREE.MeshBasicMaterial;
  coverMaterial: THREE.MeshBasicMaterial;
  firstPlateMaterial: THREE.MeshBasicMaterial;
  /** Partagé (boardsMat) sauf si comic.boardsColor le remplace par une instance propre. */
  boardsMaterial: THREE.MeshBasicMaterial;
  restX: number;
  comic: Comic;
  coverLoaded: boolean;
};

/**
 * `foldSide` vaut +1 quand la reliure est du côté des x croissants de la géométrie.
 * Le creux est quadratique : il se resserre près du pli et laisse le bord extérieur
 * à pleine valeur, et il vaut la même chose sur les deux pages au droit du pli, donc
 * le dégradé ne présente aucune marche en le franchissant.
 */
function shadeTowardsFold(
  material: THREE.MeshStandardMaterial,
  width: number,
  foldSide: 1 | -1,
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFoldSide = { value: foldSide };
    shader.uniforms.uPageWidth = { value: width };
    shader.uniforms.uGutter = { value: GUTTER_DEPTH };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform float uFoldSide;
         uniform float uPageWidth;
         uniform float uGutter;
         varying float vGutterShade;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float gutterU = clamp(0.5 + uFoldSide * position.x / uPageWidth, 0.0, 1.0);
         vGutterShade = 1.0 - uGutter * gutterU * gutterU;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying float vGutterShade;`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
         diffuseColor.rgb *= vGutterShade;`,
      );
  };
  // Sans cette clé, three réutiliserait un programme compilé pour un autre matériau.
  material.customProgramCacheKey = () => "comics-reader-page";
}

/** Pose un volume de désignation sur la pose engagée du livre (jamais sur son survol). */
function setPickPose(pick: THREE.Mesh, x: number, y: number, z: number, rotationY: number) {
  pick.position.set(x, y, z);
  pick.rotation.y = rotationY;
}

export function createScene(
  canvas: HTMLCanvasElement,
  comics: Comic[],
  opts: SceneOptions,
): SceneHandle {
  const scale = opts.reducedMotion ? 0.35 : 1;
  const dur = (ms: number) => (ms / 1000) * scale;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  function viewportPixels(): number {
    return window.innerWidth * window.innerHeight;
  }

  function pixelRatio(): number {
    return renderPixelRatio(
      viewportPixels(),
      window.devicePixelRatio,
      PIXEL_BUDGET,
      PIXEL_RATIO_FLOOR,
    );
  }

  /** Distance caméra (repos étagère) - voir mobileRestZ. */
  function shelfRestZ(): number {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    return mobileRestZ(w, h) ?? SHELF_REST_Z_DESKTOP;
  }

  /**
   * Abscisse de la caméra (et de sa cible) au repos de l'étagère.
   * indexOrderedPositions centre toute la composition sur ce point (voir
   * shelfPositions) : sur mobile, où le canevas est la seule chose affichée,
   * ce point est donc le centre de l'écran, à 0. Sur desktop, la card
   * occupant la moitié droite d'un canevas resté pleine largeur (voir
   * SHELF_CENTER_X_DESKTOP), ce même 0 mettrait la composition à cheval
   * sous elle : le décalage historique reste donc nécessaire là, seul le
   * pushedPositions qu'il compensait ayant disparu.
   */
  function shelfCenterX(): number {
    const w = canvas.clientWidth || window.innerWidth;
    return isMobileCanvas(w) ? 0 : SHELF_CENTER_X_DESKTOP;
  }

  /**
   * Abscisses des `count` livres pour la désignation `selectedIndex` -
   * indexOrderedPositions, desktop comme mobile (voir sa documentation) ;
   * seul l'écart diffère : les deux paliers fixes FIRST_NEIGHBOR_GAP/
   * NEXT_NEIGHBOR_GAP sur desktop, un écart uniforme recalculé pour tenir
   * MOBILE_GAP_PX à l'écran sur mobile - déduit du même calcul que
   * shelfRestZ, pour rester cohérent avec la largeur de couverture qu'il
   * vise (voir MOBILE_COVER_FRACTION).
   */
  function shelfPositions(count: number, selectedIndex: number): number[] {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    const restZ = mobileRestZ(w, h);
    // Toujours centrée sur l'origine du monde (0), jamais sur shelfCenterX() :
    // sur desktop, la caméra vise elle un point décalé (voir shelfCenterX)
    // pour laisser l'espace de la card à droite - un décalage entre le
    // centre de la composition et celui que vise la caméra, qui la fait
    // paraître décalée à l'écran. La recentrer ici sur ce même point
    // annulerait ce décalage voulu (la composition suivrait la caméra au
    // pixel près, plus aucun écart visible). Sur mobile, shelfCenterX() vaut
    // déjà 0 : les deux se confondent, sans changement de comportement.
    if (restZ === null) {
      return indexOrderedPositions(
        count,
        selectedIndex,
        { first: FIRST_NEIGHBOR_GAP, next: NEXT_NEIGHBOR_GAP },
        0,
      );
    }
    const halfFovRad = (SHELF_FOV * Math.PI) / 360;
    const pxPerWorldUnit = h / 2 / (restZ * Math.tan(halfFovRad));
    const gap = MOBILE_GAP_PX / pxPerWorldUnit;
    return indexOrderedPositions(count, selectedIndex, { first: gap, next: gap }, 0);
  }

  renderer.setPixelRatio(pixelRatio());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#15161b");

  const camera = new THREE.PerspectiveCamera(SHELF_FOV, 1, 0.01, 50);
  camera.position.set(shelfCenterX(), BOOK.h * 0.55, shelfRestZ());
  const camTarget = new THREE.Vector3(shelfCenterX(), BOOK.h * 0.5, 0);

  // --- environnement -------------------------------------------------------
  // Fond non éclairé à dessein : un matériau standard prendrait la tache du
  // projecteur en plein sur son cône et lirait comme un filtre gris posé sur
  // la scène - le fond doit rester plat quelle que soit la lumière qui l'atteint.
  const wallGeo = new THREE.PlaneGeometry(20, 12);
  const wallMat = new THREE.MeshBasicMaterial({ color: "#15161b" });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 2, -1.2);
  wall.receiveShadow = false;
  scene.add(wall);

  const ambient = new THREE.AmbientLight(0xffffff, AMBIENT_SHELF);
  scene.add(ambient);

  const key = new THREE.SpotLight(0xfff4e6, 26, 14, Math.PI / 5, 0.55, 1.6);
  key.position.copy(KEY_SHELF);
  key.target.position.copy(camTarget);
  /**
   * Le tactile reste sans ombre : la charge y est contrainte par le circuit
   * thermique bien plus que par le nombre de pixels.
   */
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const shadowsAllowed = !coarse;
  const readShadowSize = shadowMapSize(
    renderedPixels(viewportPixels(), pixelRatio()),
    SHADOW_FULL_PIXELS,
  );
  key.castShadow = shadowsAllowed;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);

  const rim = new THREE.DirectionalLight(0x8fb6c0, 0.1);
  rim.position.set(-3, 1.6, 1.4);
  scene.add(rim);

  /**
   * Une lampe éclaire depuis un point : elle fait forcément un côté clair et un côté
   * sombre, et un projecteur y ajoute son bord de cône. Une double page plane présentée
   * de face demande l'inverse — de la lumière venue de partout. L'éclairement de lecture
   * vient donc d'un environnement, qui ne projette aucune ombre ; la directionnelle
   * ci-dessous ne sert plus qu'à l'ombre de la feuille, et sa caméra orthographique se
   * taille exactement sur le livre ouvert : tous les texels de la carte lui servent.
   */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene(room, 0.04);
  room.dispose();

  const readLight = new THREE.DirectionalLight(0xfff4e6, 0.8);
  readLight.position.copy(READ_LIGHT_POS);
  readLight.target.position.set(0, SELECT_Y, SELECT_OUT);
  readLight.visible = false;
  readLight.shadow.mapSize.set(readShadowSize, readShadowSize);
  readLight.shadow.bias = -0.0006;
  readLight.shadow.normalBias = 0.015;
  const readShadowCam = readLight.shadow.camera;
  readShadowCam.left = -2.0;
  readShadowCam.right = 2.0;
  readShadowCam.top = 1.5;
  readShadowCam.bottom = -1.5;
  readShadowCam.near = 0.1;
  readShadowCam.far = 12;
  readShadowCam.updateProjectionMatrix();
  scene.add(readLight, readLight.target);

  renderer.shadowMap.enabled = shadowsAllowed;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  /** Une seule source d'ombre à la fois : deux donneraient deux ombres croisées. */
  function applyReadingLighting(reading: boolean) {
    readLight.visible = reading;
    readLight.castShadow = shadowsAllowed && reading;
    // Le projecteur est éteint en lecture : c'est son cône qui tranchait la double page.
    key.visible = !reading;
    key.castShadow = shadowsAllowed && !reading;
    scene.environment = reading ? envTarget.texture : null;
    scene.environmentIntensity = ENV_READ_INTENSITY;
    ambient.intensity = reading ? AMBIENT_READ : AMBIENT_SHELF;
  }

  // --- géométries partagées ------------------------------------------------
  const pagesGeo = new THREE.BoxGeometry(
    BOOK.w - COVER_T - 0.02,
    BOOK.h - 0.02,
    BOOK.t - 2 * COVER_T - 0.006,
  );
  const PLATE_INSET = 0.002;
  /** Abscisse de la charnière de la couverture, dans le repère du livre. */
  const HINGE_X = -BOOK.w / 2 + PLATE_INSET;
  const plateGeo = new THREE.BoxGeometry(BOOK.w - 2 * PLATE_INSET, BOOK.h, COVER_T);
  const spineGeo = new THREE.BoxGeometry(COVER_T, BOOK.h, BOOK.t);
  const pickGeo = new THREE.BoxGeometry(BOOK.w, BOOK.h, BOOK.t);

  const pagesMat = new THREE.MeshStandardMaterial({ color: "#efe7d6", roughness: 0.95 });
  /**
   * Tranche des plats (dos, chants, dessus) : jamais la face qui porte une texture,
   * seulement ce qui en dépasse au bord d'un livre tourné ou avancé vers la caméra -
   * y compris le mince dessus de la couverture engagée, qu'un léger surplomb de
   * caméra découvre. Éclairé (MeshStandardMaterial), ce dépassement virait au gris
   * sombre selon l'angle au lieu de rester net comme les autres faces blanches -
   * non éclairé désormais, comme couverture/dos/première planche (voir plus bas).
   */
  const boardsMat = new THREE.MeshBasicMaterial({ color: "#efefef" });
  const pickMat = new THREE.MeshBasicMaterial();
  pickMat.visible = false; // non rendu, mais toujours atteint par le lancer de rayon

  const booksRoot = new THREE.Group();
  scene.add(booksRoot);

  const textureWidth = pickTextureWidth(window.innerWidth);
  const fontFamily = headingFontFamily();
  const loader = new THREE.TextureLoader();
  const nodes: BookNode[] = [];
  const pickMeshes: THREE.Mesh[] = [];

  comics.forEach((comic, i) => {
    // Pose initiale seulement : select() (toujours appelé au montage, un
    // livre étant toujours désigné) la remplace aussitôt par shelfPositions.
    const restX = (i - (comics.length - 1) / 2) * (BOOK.t + NEXT_NEIGHBOR_GAP);

    const group = new THREE.Group();
    group.rotation.y = Math.PI / 2; // le dos fait face à la caméra
    group.position.set(restX, BOOK.h / 2, 0);

    // Non éclairés à dessein : ce sont les seules faces qui portent les visuels
    // déposés par Marie (couverture, dos, première planche). Un matériau standard
    // les faisait varier avec l'éclairage de la scène (projecteur, ambiante) -
    // ombrées, voire quasi noires en bord de cône - alors qu'elles doivent rendre
    // exactement les couleurs des images fournies, comme une reproduction fidèle.
    // Toujours blanc, jamais 0x1b1d22 comme coverMaterial plus bas : à la
    // différence de la couverture, la tranche reçoit TOUJOURS une texture
    // (l'image fournie, ou à défaut le dos peint par paintUpcomingSpine plus
    // bas) - une teinte sombre ici l'assombrirait doublement (`map` se
    // multiplie à `color`), quand paintUpcomingSpine dessine déjà son propre
    // fond sombre sur la texture elle-même.
    const spineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coverMaterial = new THREE.MeshBasicMaterial({
      color: comic.cover ? 0xffffff : 0x1b1d22,
    });
    const firstPlateMaterial = new THREE.MeshBasicMaterial({
      color: 0xefe7d6,
    });
    // Un livre à tranche sombre laisse voir ce blanc partagé à ses chants et à son
    // dos (plat 4, sans image dédiée) : une instance propre le remplace alors.
    const boardsMaterial = comic.boardsColor
      ? new THREE.MeshBasicMaterial({ color: comic.boardsColor })
      : boardsMat;

    const pages = new THREE.Mesh(pagesGeo, [
      pagesMat,
      pagesMat,
      pagesMat,
      pagesMat,
      firstPlateMaterial,
      pagesMat,
    ]);
    pages.position.x = 0;
    pages.castShadow = true;
    group.add(pages);

    const back = new THREE.Mesh(plateGeo, boardsMaterial);
    back.position.set(0, 0, -(BOOK.t / 2 - COVER_T / 2) + 0.001);
    back.castShadow = true;
    group.add(back);

    // L'ordre des matériaux d'une BoxGeometry est [+X, -X, +Y, -Y, +Z, -Z].
    const spine = new THREE.Mesh(spineGeo, [
      boardsMaterial,
      spineMaterial,
      boardsMaterial,
      boardsMaterial,
      boardsMaterial,
      boardsMaterial,
    ]);
    spine.position.x = -(BOOK.w / 2 - COVER_T / 2);
    spine.castShadow = true;
    group.add(spine);

    const coverPivot = new THREE.Group();
    // La charnière est sur la face interne de la tranche : sur le bord relié en x,
    // ET sur la face avant en z. Un pivot au milieu de l'épaisseur ferait décrire à
    // la couverture un arc qui la décolle du livre.
    coverPivot.position.set(-BOOK.w / 2 + PLATE_INSET, 0, BOOK.t / 2 - COVER_T / 2 + 0.001);
    const cover = new THREE.Mesh(plateGeo, [
      boardsMaterial,
      boardsMaterial,
      boardsMaterial,
      boardsMaterial,
      coverMaterial,
      boardsMaterial,
    ]);
    cover.position.set((BOOK.w - 2 * PLATE_INSET) / 2, 0, 0);
    cover.castShadow = true;
    coverPivot.add(cover);
    group.add(coverPivot);

    // Le volume de désignation est un frère du groupe du livre, jamais un enfant :
    // il ne doit subir ni le survol ni la sélection tant qu'on ne l'y pose pas
    // explicitement (setPickPose), sous peine de boucle de rétroaction survol/pick.
    const pickMesh = new THREE.Mesh(pickGeo, pickMat);
    setPickPose(pickMesh, restX, BOOK.h / 2, 0, Math.PI / 2);
    booksRoot.add(pickMesh);
    pickMeshes.push(pickMesh);

    booksRoot.add(group);
    nodes.push({
      group,
      pick: pickMesh,
      coverPivot,
      spineMaterial,
      coverMaterial,
      firstPlateMaterial,
      boardsMaterial,
      restX,
      comic,
      coverLoaded: false,
    });

    if (comic.spine) {
      loader.load(comic.spine, (tex) => {
        if (disposed) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        // Les proportions de l'image fournie ne correspondent pas toujours à
        // celles de la face de tranche (ex. Mazou) : un recadrage centré
        // plutôt qu'un étirement qui déformerait le dessin d'origine.
        coverTexture(tex, SPINE_FACE_ASPECT);
        spineMaterial.map = tex;
        spineMaterial.needsUpdate = true;
        markDirty();
      });
    } else {
      spineMaterial.map = paintUpcomingSpine(comic.title, comic.accent, fontFamily);
      spineMaterial.needsUpdate = true;
    }
  });

  async function ensureCover(node: BookNode) {
    if (node.coverLoaded || !node.comic.cover) return;
    node.coverLoaded = true;
    try {
      const tex = await loadCoverTexture(node.comic.cover, textureWidth);
      if (disposed) { tex.dispose(); return; }
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      node.coverMaterial.map = tex;
      node.coverMaterial.needsUpdate = true;
      markDirty();
    } catch {
      node.coverLoaded = false;
      return;
    }

    const firstPlate = node.comic.plates[0];
    if (!firstPlate) return;
    try {
      const tex = await loadCoverTexture(firstPlate, textureWidth);
      if (disposed) { tex.dispose(); return; }
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      // Pendant une fermeture la face porte la page quittée : la planche 1 attend.
      if (lent?.node === node) {
        lent.plate = tex;
        return;
      }
      // Sans ce blanc, la planche restait multipliée par le crème posé plus haut
      // comme couleur de base (pour la page nue, avant planche) - jaunissant
      // toute image chargée par-dessus au lieu de rendre ses couleurs vraies.
      node.firstPlateMaterial.color.set(0xffffff);
      node.firstPlateMaterial.map = tex;
      node.firstPlateMaterial.needsUpdate = true;
      markDirty();
    } catch {
      // La page reste crème : l'ouverture fonctionne sans la planche.
    }
  }

  // --- pages de lecture ----------------------------------------------------
  // Le groupe de lecture n'est rattaché au livre qu'à l'ouverture : il suit alors sa
  // pose engagée sans que la scène ait à recopier position et rotation.
  const readerPageGeo = new THREE.PlaneGeometry(BOOK.w, BOOK.h);
  const leftPageMaterial = new THREE.MeshStandardMaterial({ color: 0xefe7d6, roughness: 0.95 });
  const rightPageMaterial = new THREE.MeshStandardMaterial({ color: 0xefe7d6, roughness: 0.95 });
  shadeTowardsFold(leftPageMaterial, BOOK.w, 1);
  shadeTowardsFold(rightPageMaterial, BOOK.w, -1);

  // Le pli de la double page est la charnière de la couverture, pas le centre du livre
  // fermé : centrée sur ce dernier, la double page débordait le bloc d'une demi-page à
  // droite et laissait paraître autour d'elle le livre qu'elle était censée ouvrir.
  const readingGroup = new THREE.Group();
  readingGroup.position.x = HINGE_X;
  readingGroup.visible = false;

  // Les pages fixes reçoivent l'ombre mais n'en projettent pas : plaquées sur le bloc
  // du livre, leur ombre n'apporterait rien et salirait la page voisine.
  // La page de gauche est collée à l'intérieur de la couverture et tourne avec elle ;
  // la rotation d'un demi-tour la remet à l'endroit une fois la couverture rabattue.
  const leftPage = new THREE.Mesh(readerPageGeo, leftPageMaterial);
  leftPage.position.set(BOOK.w / 2, 0, -COVER_T / 2 - 0.002);
  leftPage.rotation.y = Math.PI;
  leftPage.castShadow = false;
  leftPage.receiveShadow = true;
  leftPage.visible = false;

  const rightPage = new THREE.Mesh(readerPageGeo, rightPageMaterial);
  rightPage.position.set(BOOK.w / 2, 0, BOOK.t / 2 + 0.002);
  rightPage.castShadow = false;
  rightPage.receiveShadow = true;
  readingGroup.add(rightPage);

  const turnPage = createTurnPage(BOOK.w, BOOK.h, GUTTER_DEPTH);
  turnPage.pivot.position.set(0, 0, BOOK.t / 2 + 0.006);
  readingGroup.add(turnPage.pivot);

  /**
   * Fond assombri (25% de noir) posé entre le livre en lecture et le reste de
   * l'étagère (voir READ_BACKDROP_Z) : sans lui, les livres voisins et la
   * pièce restent visibles et pleinement éclairés autour de la double page,
   * qui devrait pourtant seule occuper l'attention. Un plan du monde, pas un
   * enfant du livre : il ne doit ni tourner ni avancer avec lui.
   */
  const readBackdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 }),
  );
  readBackdrop.scale.set(40, 40, 1);
  readBackdrop.visible = false;
  scene.add(readBackdrop);

  let readingNode: BookNode | null = null;
  let readingSpreads: Spread[] = [];
  let readingIndex = 0;
  const reverse = () => readingNode?.comic.reverseReading ?? false;

  /**
   * Le pli de la double page est l'origine du livre : la caméra et sa cible le visent,
   * plutôt qu'un x fixe. La mise en avant peut n'être pas finie quand la lecture
   * s'ouvre — le livre glisse alors encore depuis sa case d'étagère, et un x fixe
   * laisserait la double page se recadrer en cours d'ouverture.
   */
  function aimAtFold(node: BookNode, reach = 1) {
    // `reach` fait glisser la visée du centre du livre fermé vers le pli pendant
    // l'ouverture, au lieu de l'y sauter d'une demi-page.
    camera.position.x = node.group.position.x + HINGE_X * reach;
    camTarget.x = camera.position.x;
  }

  const plateCache = new Map<string, THREE.Texture>();

  async function plateTexture(url: string | null): Promise<THREE.Texture | null> {
    if (!url) return null;
    const cached = plateCache.get(url);
    if (cached) return cached;
    let tex: THREE.Texture;
    try {
      tex = await loadCoverTexture(url, textureWidth);
    } catch {
      return null; // la planche n'est pas arrivée : l'appelant garde ce qu'il affiche
    }
    // La lecture a pu s'arrêter pendant le chargement : le cache vient alors d'être
    // vidé, et y ranger cette planche la laisserait en mémoire graphique sans porteur.
    if (disposed || readingNode === null) {
      tex.dispose();
      return null;
    }
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    plateCache.set(url, tex);
    return tex;
  }

  /** Ne garde que la double page courante, la précédente et la suivante. */
  function trimPlateCache(spreads: Spread[], current: number) {
    const keep = new Set<string>();
    for (const i of [current - 1, current, current + 1]) {
      const s = spreads[i];
      if (!s) continue;
      if (s.left) keep.add(s.left);
      if (s.right) keep.add(s.right);
    }
    for (const [url, tex] of plateCache) {
      if (keep.has(url)) continue;
      // Une page qui attend sa planche montre encore la précédente : celle-là survit
      // au nettoyage, sinon elle disparaîtrait de l'écran.
      if (tex === leftPageMaterial.map || tex === rightPageMaterial.map) continue;
      tex.dispose();
      plateCache.delete(url);
    }
  }

  /** Charge la double page d'après dans le sens du geste, sans bloquer. */
  async function preloadNeighbour(from: number, direction: 1 | -1) {
    const spread = readingSpreads[from + direction];
    if (!spread) return;
    const shown = presentSpread(spread, reverse());
    await Promise.all([plateTexture(shown.left), plateTexture(shown.right)]);
    markDirty();
  }

  /**
   * Une page sans texture rend le crème du papier, que le lecteur lit comme une page
   * blanche. Une planche attendue mais pas encore là laisse donc la page telle quelle ;
   * seule une page de garde, qui n'a pas de planche, se montre nue.
   *
   * `color` doit suivre `map` : posé au crème par défaut pour cette page nue, il
   * jaunissait sinon toute planche chargée par-dessus (`map` se multiplie à
   * `color`) au lieu de rendre ses couleurs vraies - blanc dès qu'une texture
   * est là, crème seulement quand la page reste nue.
   */
  function showPlate(
    material: THREE.MeshStandardMaterial,
    url: string | null,
    texture: THREE.Texture | null,
  ) {
    if (url !== null && texture === null) return;
    material.map = texture;
    material.color.set(texture ? 0xffffff : 0xefe7d6);
    material.needsUpdate = true;
  }

  /** Une planche qui arrive après un changement de double page ne doit plus rien écrire. */
  let spreadToken = 0;
  let retryTimer = 0;

  async function applySpread(n: number, attempt = 0) {
    const spread = readingSpreads[n];
    if (!spread) return;
    const token = ++spreadToken;
    const shown = presentSpread(spread, reverse());
    const [left, right] = await Promise.all([plateTexture(shown.left), plateTexture(shown.right)]);
    // Une double page plus récente a pu se poser pendant le chargement : c'est la
    // sienne qui est à l'écran, la remplacer ferait reculer la lecture.
    if (disposed || token !== spreadToken) return;
    showPlate(leftPageMaterial, shown.left, left);
    showPlate(rightPageMaterial, shown.right, right);
    trimPlateCache(readingSpreads, n);
    markDirty();
    if ((shown.left && !left) || (shown.right && !right)) retryPlates(n, token, attempt);
    void preloadNeighbour(n, 1);
  }

  /**
   * Reprise d'une planche absente : la page garde la précédente et bascule dès que
   * celle-ci arrive. Les délais s'espacent, et la reprise s'arrête — au-delà, insister
   * ne fait plus que charger le réseau.
   */
  function retryPlates(n: number, token: number, attempt: number) {
    if (attempt >= PLATE_RETRY_MS.length) return;
    const delay = PLATE_RETRY_MS[attempt];
    window.clearTimeout(retryTimer);
    retryTimer = window.setTimeout(() => {
      if (disposed || token !== spreadToken || readingIndex !== n) return;
      void applySpread(n, attempt + 1);
    }, delay);
  }

  async function openForReading(index: number, spread: number, animate: boolean): Promise<void> {
    const node = nodes[index];
    if (!node) return;
    returnFirstPlate();
    selected = index;
    readingNode = node;
    readingSpreads = buildSpreads(node.comic.plates, node.comic.overlappingPlates);
    readingIndex = clampSpreadIndex(spread, readingSpreads.length);

    node.group.add(readingGroup);
    node.coverPivot.add(leftPage);
    readingGroup.visible = false;
    leftPage.visible = false;
    applyReadingLighting(true);
    turnPage.setVisible(false);
    readBackdrop.position.set(node.group.position.x + HINGE_X, SELECT_Y, READ_BACKDROP_Z);
    readBackdrop.visible = true;

    // Les planches d'abord : montrées avant, les deux pages nues remplissent le cadre
    // d'un aplat crème, la caméra étant encore à la distance de la pose engagée.
    await applySpread(readingIndex);
    if (disposed) return;
    // Tant que la couverture la cache, la page de droite est portée par la face du bloc,
    // au même endroit : sa relève par la page de lecture ne se voit pas.
    lendRightPage(node, false);

    const aim = { reach: Math.abs(camera.position.x - node.group.position.x) / -HINGE_X };
    aimAtFold(node, aim.reach);
    const tl = gsap.timeline({
      onUpdate: () => {
        aimAtFold(node, aim.reach);
        // La page de droite sort du bloc et celle de gauche de l'intérieur de la
        // couverture : toutes deux ne regardent la caméra qu'une fois la couverture
        // passée de l'autre côté de son axe.
        if (node.coverPivot.rotation.y <= READ_OPEN_ANGLE / 2) {
          readingGroup.visible = true;
          leftPage.visible = true;
        }
        markDirty();
      },
    });
    const d = animate && !opts.reducedMotion ? dur(1100) : 0;
    // Le livre peut arriver ici juste désigné (HOVER_OUT, pas encore tourné
    // vers la caméra) - depuis le panneau, sans second clic préalable. Ces
    // deux tweens l'amènent à la pose engagée quel que soit son point de
    // départ ; déjà là (lien profond via enterImmediate), ils ne font rien.
    tl.to(node.group.position, { y: SELECT_Y, z: SELECT_OUT, duration: d, ease: "power2.inOut" }, 0)
      .to(node.group.rotation, { y: 0, duration: d, ease: "power2.inOut" }, 0)
      .to(aim, { reach: 1, duration: d, ease: "power2.inOut" }, 0)
      .to(node.coverPivot.rotation, { y: READ_OPEN_ANGLE, duration: d, ease: "power2.inOut" }, 0)
      .to(camera.position, { y: SELECT_Y, z: SELECT_OUT + readBack(), duration: d }, 0)
      .to(camTarget, { y: SELECT_Y, z: 0, duration: d }, 0)
      .to(
        camera,
        { fov: READ_FOV, duration: d, onUpdate: () => camera.updateProjectionMatrix() },
        0,
      )
      .to(key.position, { x: KEY_READ.x, y: KEY_READ.y, z: KEY_READ.z, duration: d }, 0);
    await tl;
    // Une durée nulle ne déclenche aucun onUpdate : la projection et la double page
    // se posent ici. Le masquage de la barre de navigation vient d'élargir le canevas :
    // sans ce recadrage, le tampon de rendu garderait la largeur d'avant.
    readingGroup.visible = true;
    leftPage.visible = true;
    returnFirstPlate();
    aimAtFold(node);
    resize();
  }

  async function goToSpread(target: number, animate: boolean): Promise<void> {
    const next = clampSpreadIndex(target, readingSpreads.length);
    if (next === readingIndex) return;
    const forward = next > readingIndex;

    if (!animate || opts.reducedMotion) {
      readingIndex = next;
      await applySpread(next);
      return;
    }

    // La feuille qui tourne est la MÊME dans les deux sens : à t = 0 elle est à
    // droite, à t = 1 elle est à gauche. Avancer va de 0 vers 1, reculer de 1 vers
    // 0. Aucune symétrie à appliquer : c'est le sens de l'animation qui change.
    const from = presentSpread(readingSpreads[readingIndex], reverse());
    const to = presentSpread(readingSpreads[next], reverse());
    const frontUrl = forward ? from.right : to.right;
    const backUrl = forward ? to.left : from.left;
    // La feuille quitte un côté : ce côté doit déjà porter la planche qu'elle découvre,
    // sinon la même planche s'affiche deux fois pendant le geste.
    const revealedUrl = forward ? to.right : to.left;
    const [front, back, revealed] = await Promise.all([
      plateTexture(frontUrl),
      plateTexture(backUrl),
      plateTexture(revealedUrl),
    ]);
    if (disposed) return;

    // Une feuille dont le recto ou le verso manque tournerait en papier nu. Le geste se
    // fait alors sans elle : les pages fixes gardent ce qu'elles montrent jusqu'à ce que
    // la planche arrive.
    if ((frontUrl && !front) || (backUrl && !back)) {
      readingIndex = next;
      await applySpread(next);
      return;
    }

    showPlate(forward ? rightPageMaterial : leftPageMaterial, revealedUrl, revealed);

    turnPage.setFaces(front, back);
    const progress = { t: forward ? 0 : 1 };
    turnPage.setProgress(progress.t);
    turnPage.setVisible(true);

    await gsap.to(progress, {
      t: forward ? 1 : 0,
      duration: dur(700),
      ease: "power2.inOut",
      onUpdate: () => {
        if (disposed) return;
        turnPage.setProgress(progress.t);
        markDirty();
      },
    });

    // La feuille reste visible le temps que les pages fixes prennent leurs nouvelles
    // planches : à l'arrivée elle recouvre le côté qui change, donc la bascule ne se
    // voit pas. La masquer d'abord laisserait paraître le crème du papier nu.
    readingIndex = next;
    await applySpread(next);
    markDirty();
    turnPage.setVisible(false);
    turnPage.setFaces(null, null);
    void preloadNeighbour(next, forward ? 1 : -1);
  }

  /**
   * Une fois les pages de lecture rangées, c'est la face avant du bloc de pages qui
   * paraît dans l'entrebâillement de la couverture : elle y montrerait la planche 1.
   * Le temps de la fermeture, elle porte la page de droite qu'on quittait.
   */
  let lent: {
    node: BookNode;
    plate: THREE.Texture | null;
    shown: THREE.Texture | null;
    owned: boolean;
  } | null = null;

  /**
   * `owned` : la texture quitte le cache et sera libérée au retour de la planche 1.
   * Sans lui, elle reste au cache, qui l'utilise encore pour la page de lecture.
   */
  function lendRightPage(node: BookNode, owned: boolean) {
    returnFirstPlate();
    const shown = rightPageMaterial.map;
    // Sortie du cache, la texture échappe au nettoyage de stopReading.
    if (owned) for (const [url, tex] of plateCache) if (tex === shown) plateCache.delete(url);
    lent = { node, plate: node.firstPlateMaterial.map, shown, owned };
    node.firstPlateMaterial.map = shown;
    node.firstPlateMaterial.needsUpdate = true;
  }

  function returnFirstPlate() {
    if (!lent) return;
    const { node, plate, shown, owned } = lent;
    lent = null;
    node.firstPlateMaterial.map = plate;
    node.firstPlateMaterial.needsUpdate = true;
    if (owned) shown?.dispose();
    markDirty();
  }

  /** Range les pages de lecture : le livre redevient un volume fermé comme les autres. */
  function stopReading() {
    turning = false;
    window.clearTimeout(retryTimer);
    spreadToken += 1;
    turnPage.setVisible(false);
    turnPage.setFaces(null, null);
    readingGroup.visible = false;
    readingGroup.removeFromParent();
    leftPage.visible = false;
    leftPage.removeFromParent();
    readingNode = null;
    readingSpreads = [];
    readingIndex = 0;
    for (const tex of plateCache.values()) tex.dispose();
    plateCache.clear();
    leftPageMaterial.map = null;
    rightPageMaterial.map = null;
    leftPageMaterial.needsUpdate = true;
    rightPageMaterial.needsUpdate = true;
  }

  // --- boucle de rendu à la demande ---------------------------------------
  let dirty = true;
  let visible = true;
  let disposed = false;
  function markDirty() {
    dirty = true;
  }
  renderer.setAnimationLoop(() => {
    if (!dirty || !visible) return;
    dirty = false;
    camera.lookAt(camTarget);
    renderer.render(scene, camera);
  });
  // Pas de gsap.ticker ici : ce serait rendre à chaque image et annuler le rendu à la
  // demande. Chaque timeline lève le drapeau par son propre onUpdate.

  // --- désignation ---------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let picking = true;
  let turning = false;
  let hovered: number | null = null;
  let selected: number | null = null;

  /**
   * Au tactile, poser le doigt sur le canevas est aussi le premier geste d'un
   * défilement de la page : réagir dès pointerdown (comme le fait la souris,
   * où down/up sont quasi confondus) ouvrirait le livre désigné sous le doigt
   * qui ne fait que commencer à scroller. La désignation/l'ouverture tactile
   * n'a donc lieu qu'au retrait du doigt (pointerup), et seulement s'il n'a
   * ni assez bougé depuis (TAP_MAX_MOVE_PX - un défilement) ni trop attendu
   * (TAP_MAX_DURATION_MS - un appui long) ; pointercancel (le navigateur
   * reconnaît lui-même un défilement et reprend la main) l'annule aussi.
   * La souris garde son comportement au pointerdown, inchangé.
   */
  const TAP_MAX_MOVE_PX = 10;
  const TAP_MAX_DURATION_MS = 500;
  let pendingTap: { pointerId: number; x: number; y: number; time: number } | null = null;

  function pickIndex(event: PointerEvent): number | null {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickMeshes, false)[0];
    if (!hit) return null;
    const index = pickMeshes.indexOf(hit.object as THREE.Mesh);
    return index >= 0 ? index : null;
  }

  function onPointerMove(event: PointerEvent) {
    if (pendingTap && event.pointerId === pendingTap.pointerId) {
      const moved = Math.hypot(event.clientX - pendingTap.x, event.clientY - pendingTap.y);
      if (moved > TAP_MAX_MOVE_PX) pendingTap = null; // défilement : le tap en attente est annulé
    }
    if (!picking) return;
    const index = pickIndex(event);
    if (index === hovered) return;
    setHover(index);
    opts.onHoverChange(index);
  }

  function onPointerDown(event: PointerEvent) {
    // La scène ne connaît pas l'état de la machine : elle expose l'intention de
    // tourner, c'est ShelfShell qui la filtre.
    if (turning) {
      const rect = canvas.getBoundingClientRect();
      const half: -1 | 1 = (event.clientX - rect.left) / rect.width < 0.5 ? -1 : 1;
      opts.onTurn(half);
      return;
    }
    if (!picking) return;

    if (event.pointerType === "touch") {
      pendingTap = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
      return;
    }

    const index = pickIndex(event);
    if (index !== null) opts.onPick(index);
    else opts.onDismiss();
  }

  function onPointerUp(event: PointerEvent) {
    if (!pendingTap || event.pointerId !== pendingTap.pointerId) return;
    const tap = pendingTap;
    pendingTap = null;
    if (!picking || turning) return;
    if (performance.now() - tap.time > TAP_MAX_DURATION_MS) return; // appui long : pas de désignation/ouverture
    const index = pickIndex(event);
    if (index !== null) opts.onPick(index);
    else opts.onDismiss();
  }

  function onPointerCancel(event: PointerEvent) {
    if (pendingTap && event.pointerId === pendingTap.pointerId) pendingTap = null;
  }

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);

  function setHover(index: number | null) {
    hovered = index;
    nodes.forEach((node, i) => {
      // Le livre désigné garde son avancée pleine (HOVER_OUT, jamais SELECT_OUT
      // - réservé à l'ouverture) quel que soit le survol. Survoler l'AUTRE livre
      // le fait bondir aussi, mais moins (HOVER_OUT_UNSELECTED) et depuis SON
      // repos (SPINE_REST_Z, pas 0) : un bond absolu le ramènerait aussi près de
      // la caméra que HOVER_OUT lui-même, ce que SPINE_REST_Z corrige justement -
      // et exposerait à nouveau le dessus du bloc de pages (voir SPINE_REST_Z).
      gsap.to(node.group.position, {
        z: i === selected ? HOVER_OUT : i === index ? SPINE_REST_Z + HOVER_OUT_UNSELECTED : SPINE_REST_Z,
        duration: dur(220),
        ease: "power2.out",
        onUpdate: markDirty,
      });
    });
    if (index !== null) void ensureCover(nodes[index]);
    markDirty();
  }

  // --- transitions ---------------------------------------------------------
  /** Coupe nos animations sans toucher à celles du reste de la page. */
  function killOurTweens() {
    const targets: object[] = [camera, camera.position, camTarget, key.position, ambient];
    for (const node of nodes) {
      targets.push(node.group.position, node.group.rotation, node.coverPivot.rotation);
    }
    gsap.killTweensOf(targets);
  }

  function timeline() {
    return gsap.timeline({
      defaults: { ease: "power3.inOut", overwrite: "auto" },
      onUpdate: markDirty,
    });
  }

  /**
   * La désignation reste à l'échelle du survol (HOVER_OUT, pas SELECT_OUT) et
   * ne bouge pas la caméra vers le livre : elle se contente de tourner le
   * livre vers la caméra et de resserrer l'étagère autour de lui, sans
   * jamais faire varier la place de chacun dans l'alignement (voir
   * shelfPositions/indexOrderedPositions), plutôt que de le pousser sur une
   * abscisse de repos figée d'avant toute désignation. Le gros plan
   * (SELECT_OUT + zoom caméra) est réservé à l'ouverture (open /
   * openForReading), pas à la simple désignation. Elle ramène en revanche
   * toujours la caméra à sa distance de repos (shelfRestZ) : c'est désormais
   * le seul point d'entrée du repos de l'étagère, un livre y étant toujours
   * désigné (voir exit() dans ShelfShell, qui l'appelle au lieu de
   * désélectionner).
   */
  async function select(index: number, animate: boolean): Promise<void> {
    selected = index;
    void ensureCover(nodes[index]);
    const xs = shelfPositions(nodes.length, index);

    // La désignation suit la pose engagée dès l'appel : elle ne doit jamais
    // dépendre d'un soulèvement de survol en cours.
    nodes.forEach((node, i) => {
      const isSelected = i === index;
      setPickPose(
        node.pick,
        xs[i],
        BOOK.h / 2,
        isSelected ? HOVER_OUT : SPINE_REST_Z,
        isSelected ? 0 : Math.PI / 2,
      );
    });

    const d = animate ? dur(900) : 0;
    const centerX = shelfCenterX();
    const tl = timeline();
    tl.to(camera.position, { x: centerX, y: BOOK.h * 0.55, z: shelfRestZ(), duration: d }, 0);
    tl.to(camTarget, { x: centerX, duration: d }, 0);

    nodes.forEach((node, i) => {
      const isSelected = i === index;
      tl.to(
        node.group.position,
        { x: xs[i], y: BOOK.h / 2, z: isSelected ? HOVER_OUT : SPINE_REST_Z, duration: d },
        0,
      ).to(node.group.rotation, { y: isSelected ? 0 : Math.PI / 2, duration: d }, 0);
    });

    await tl;
  }

  async function close(animate: boolean): Promise<void> {
    if (selected === null) return;
    const node = nodes[selected];

    // On quitte la lecture sur la double page qu'on lisait : la ranger ici la ferait
    // disparaître avant même le dézoom. Elle tient jusqu'au passage de la couverture,
    // à l'angle même qui l'avait découverte à l'ouverture.
    let stowed = false;
    const stow = () => {
      if (stowed) return;
      stowed = true;
      if (readingNode === node) lendRightPage(node, true);
      stopReading();
      applyReadingLighting(false);
      readBackdrop.visible = false;
    };
    if (readingNode === null) stow();

    const tl = gsap.timeline({
      onUpdate: () => {
        if (node.coverPivot.rotation.y > READ_OPEN_ANGLE / 2) stow();
        markDirty();
      },
    });
    // Fermeture totale visée à 1s (dur(200) + dur(800), la branche la plus longue) :
    // en sortie de lecture l'œil n'a plus rien de nouveau à découvrir, contrairement à
    // l'ouverture qui révèle la double page - une fermeture plus lente ne faisait
    // que retarder le retour à l'étagère, perçu comme mou plutôt que soigné.
    // Pose transitoire (légèrement plus proche que le repos) avant que
    // select(), appelé juste après par ShelfShell, ne ramène la caméra à
    // shelfRestZ() : le -0.6 reste relatif à cette distance de repos plutôt
    // qu'à l'ancienne constante fixe, pour garder le même effet de recul
    // quel que soit le cadrage (desktop ou mobile).
    const centerX = shelfCenterX();
    const restZ = shelfRestZ();
    if (animate && !opts.reducedMotion) {
      tl.to(
        camera.position,
        { x: centerX, z: restZ - 0.6, y: BOOK.h * 0.55, duration: dur(800), ease: "power2.out" },
        0,
      )
        .to(camTarget, { x: centerX, y: BOOK.h * 0.5, z: 0, duration: dur(800) }, 0)
        .to(camera, { fov: SHELF_FOV, duration: dur(800), onUpdate: () => camera.updateProjectionMatrix() }, 0)
        .to(
          key.position,
          { x: KEY_SHELF.x, y: KEY_SHELF.y, z: KEY_SHELF.z, duration: dur(800) },
          0,
        );
    } else {
      camera.position.set(centerX, BOOK.h * 0.55, restZ - 0.6);
      camTarget.set(centerX, BOOK.h * 0.5, 0);
      camera.fov = SHELF_FOV;
      camera.updateProjectionMatrix();
      key.position.copy(KEY_SHELF);
    }
    tl.to(
      node.coverPivot.rotation,
      { y: 0, duration: animate ? dur(800) : 0, ease: "power2.inOut" },
      animate ? dur(200) : 0,
    );
    await tl;
    stow(); // filet : une durée nulle n'émet aucun onUpdate
    returnFirstPlate();
  }

  function enterImmediate(index: number) {
    killOurTweens();
    returnFirstPlate(); // une fermeture interrompue ne rend jamais la planche 1
    stopReading();
    applyReadingLighting(false);
    readBackdrop.visible = false;
    selected = index;
    void ensureCover(nodes[index]);
    const xs = shelfPositions(nodes.length, index);
    nodes.forEach((node, i) => {
      if (i === index) {
        setPickPose(node.pick, 0, BOOK.h / 2 + 0.15, SELECT_OUT, 0);
        node.group.position.set(0, BOOK.h / 2 + 0.15, SELECT_OUT);
        node.group.rotation.y = 0;
        node.coverPivot.rotation.y = OPEN_ANGLE;
      } else {
        setPickPose(node.pick, xs[i], BOOK.h / 2, SPINE_REST_Z, Math.PI / 2);
        node.group.position.set(xs[i], BOOK.h / 2, SPINE_REST_Z);
      }
    });
    camera.position.set(0, BOOK.h * 0.52, SELECT_OUT + 0.16);
    camTarget.set(0, BOOK.h * 0.44, -0.2);
    camera.fov = 58;
    camera.updateProjectionMatrix();
    key.position.copy(KEY_SHELF);
    markDirty();
  }

  /** Recul de lecture : le format de la fenêtre décide si c'est la hauteur ou la largeur
   *  de la double page qui commande. */
  function readBack(): number {
    return readingBack(camera.aspect, READ_FOV);
  }

  /**
   * Boîte englobante, en pixels CSS depuis le bord gauche du canevas, pas
   * celle des livres tels qu'ils sont en ce moment (nodes[].group) : un
   * mouvement de la caméra ou une désignation en cours n'a donc pas à être
   * terminé pour lire une position à jour. La largeur occupée et son centre
   * ne dépendent plus de quel livre est désigné (voir indexOrderedPositions
   * dans shelfPositions) - les trois désignations possibles (un seul livre à
   * la fois, jamais plus de trois sur cette étagère) donnent donc la même
   * boîte ; les énumérer quand même coûte peu et évite de supposer que
   * `selected` reflète toujours la désignation voulue par l'appelant. La
   * card (contentRightEdge) et le curseur (contentCenterX) restent ainsi à
   * une position constante.
   */
  function contentBoundsPx(): { minPx: number; maxPx: number; topPx: number; bottomPx: number } {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    // updateMatrixWorld: .project() lit la matrice caméra telle qu'elle était au
    // dernier rendu, qui peut dater d'avant le dernier déplacement des livres.
    camera.lookAt(camTarget);
    camera.updateMatrixWorld();
    let minPx = Infinity;
    let maxPx = -Infinity;
    let topPx = Infinity;
    let bottomPx = -Infinity;
    const corner = new THREE.Vector3();
    for (let selectedIndex = 0; selectedIndex < nodes.length; selectedIndex++) {
      const xs = shelfPositions(nodes.length, selectedIndex);
      nodes.forEach((_, i) => {
        const halfW = (i === selectedIndex ? BOOK.w : BOOK.t) / 2;
        for (const x of [xs[i] - halfW, xs[i] + halfW]) {
          for (const y of [0, BOOK.h]) {
            for (const z of [-BOOK.t / 2, HOVER_OUT + BOOK.t / 2]) {
              corner.set(x, y, z).project(camera);
              const px = ((corner.x + 1) / 2) * w;
              minPx = Math.min(minPx, px);
              maxPx = Math.max(maxPx, px);
              // NDC y = -1 en bas, +1 en haut - inverse de l'axe écran, qui
              // grandit vers le bas depuis le sommet du canevas.
              const py = ((1 - corner.y) / 2) * h;
              if (y === 0) bottomPx = Math.max(bottomPx, py);
              if (y === BOOK.h) topPx = Math.min(topPx, py);
            }
          }
        }
      });
    }
    return { minPx, maxPx, topPx, bottomPx };
  }

  /** Voir SceneHandle.contentRightEdge. */
  function contentRightEdge(): number {
    return contentBoundsPx().maxPx;
  }

  /** Voir SceneHandle.contentCenterX. */
  function contentCenterX(): number {
    const { minPx, maxPx } = contentBoundsPx();
    return (minPx + maxPx) / 2;
  }

  /** Voir SceneHandle.contentTopY. */
  function contentTopY(): number {
    return contentBoundsPx().topPx;
  }

  /** Voir SceneHandle.contentBottomY. */
  function contentBottomY(): number {
    return contentBoundsPx().bottomPx;
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    // La fenêtre a pu changer de taille ou d'écran : le plafond de pixels rendus se
    // recalcule avant la taille du tampon, qui en dépend.
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Seule la projection est réécrite : les positions sont peut-être en cours d'animation.
    camera.updateProjectionMatrix();
    // Sauf en lecture, où le recul dépend du format : une fenêtre étroite couperait
    // la double page par les côtés.
    if (readingNode) {
      camera.position.z = SELECT_OUT + readBack();
      aimAtFold(readingNode);
    } else if (selected !== null) {
      // Rattrapage sans animation (rotation d'écran, redimensionnement de
      // fenêtre) : la distance caméra, le centrage et les écarts entre
      // livres dépendent de la largeur du canevas sur mobile (voir
      // shelfRestZ/shelfPositions/shelfCenterX), et doivent donc suivre
      // plutôt que rester figés sur la valeur calculée à la dernière
      // désignation.
      const centerX = shelfCenterX();
      camera.position.set(centerX, BOOK.h * 0.55, shelfRestZ());
      camTarget.set(centerX, BOOK.h * 0.5, 0);
      const xs = shelfPositions(nodes.length, selected);
      nodes.forEach((node, i) => {
        const isSelected = i === selected;
        node.group.position.x = xs[i];
        setPickPose(
          node.pick,
          xs[i],
          BOOK.h / 2,
          isSelected ? HOVER_OUT : SPINE_REST_Z,
          isSelected ? 0 : Math.PI / 2,
        );
      });
    }
    markDirty();
  }
  resize();

  return {
    setHover,
    select,
    close,
    enterImmediate,
    openForReading,
    goToSpread,
    currentSpread() {
      return readingIndex;
    },
    spreadCount() {
      return readingSpreads.length;
    },
    setPickingEnabled(enabled) {
      picking = enabled;
      if (!enabled && hovered !== null) {
        setHover(null);
        opts.onHoverChange(null);
      }
    },
    setTurningEnabled(enabled) {
      turning = enabled;
    },
    setVisible(v) {
      visible = v;
      if (v) markDirty();
    },
    renderOnce() {
      camera.lookAt(camTarget);
      renderer.render(scene, camera);
    },
    resize,
    contentRightEdge,
    contentCenterX,
    contentTopY,
    contentBottomY,
    dispose() {
      disposed = true;
      killOurTweens();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      returnFirstPlate();
      stopReading();
      turnPage.dispose();
      readerPageGeo.dispose();
      [leftPageMaterial, rightPageMaterial].forEach((m) => m.dispose());
      readBackdrop.geometry.dispose();
      (readBackdrop.material as THREE.Material).dispose();
      [pagesGeo, plateGeo, spineGeo, pickGeo, wallGeo].forEach((g) => g.dispose());
      [pagesMat, boardsMat, pickMat, wallMat].forEach((m) => m.dispose());
      nodes.forEach((n) => {
        n.spineMaterial.map?.dispose();
        n.coverMaterial.map?.dispose();
        n.firstPlateMaterial.map?.dispose();
        n.spineMaterial.dispose();
        n.coverMaterial.dispose();
        n.firstPlateMaterial.dispose();
        // boardsMat (partagé) est déjà disposé ci-dessus : seule une instance
        // propre à comic.boardsColor reste à disposer ici.
        if (n.boardsMaterial !== boardsMat) n.boardsMaterial.dispose();
      });
      key.dispose();
      readLight.dispose();
      rim.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
