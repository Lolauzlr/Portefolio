import { gsap } from "gsap";
import * as THREE from "three";
import type { Comic } from "@/lib/comics";
import { createTurnPage } from "@/components/comics/page-turn";
import {
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
const COVER_T = 0.022;
const GAP = 0.012;
const HOVER_OUT = 0.09;
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
 * Écart (au-delà du contact tranche à tranche/couverture) entre le livre
 * désigné et son premier voisin, à droite puis à gauche. La caméra n'étant
 * plus centrée sur la scène au repos (SHELF_CENTER_X, plus bas) mais décalée
 * vers la droite, un voisin à gauche s'en écarte bien plus qu'un voisin à
 * droite - il cesse d'être vu tranche pile face, laissant deviner en biais
 * un peu de son plat, ce qui grignote l'écart voulu s'il n'est pas plus
 * généreux de ce côté. Calibré pixel par pixel (mesure d'écran, pas de
 * formule) pour un écart visible net à la largeur de référence (2000px).
 */
const FIRST_NEIGHBOR_JEU_RIGHT = 0.118;
const FIRST_NEIGHBOR_JEU_LEFT = 0.47;
/**
 * Écart pour le second voisin d'un côté, au-delà du premier qui penche
 * (voir FAN_TILT_ANGLE_Z) - n'entre en jeu que lorsque le livre désigné est
 * à une extrémité de l'étagère (Old Knight ou À venir), le seul cas avec
 * deux voisins du même côté. Le premier voisin penche justement vers ce
 * second, pied ancré mais haut basculé dans son espace (voir groundedPose) :
 * un écart droit/gauche distinct comme pour FIRST_NEIGHBOR_JEU_*. À gauche
 * (Old Knight, quand À venir est désigné) volontairement resserré : Old
 * Knight doit rester collé à No Finder et dans le cadre, cliquable - un
 * écart généreux (comme l'asymétrie caméra le suggérerait, cf.
 * FIRST_NEIGHBOR_JEU_*) le pousse hors champ sans vraiment supprimer le
 * plat de couverture qu'on devine en biais à cette distance.
 */
const NEXT_NEIGHBOR_JEU_RIGHT = 0.16;
const NEXT_NEIGHBOR_JEU_LEFT = 0.2;
/**
 * Inclinaison (rotation.z, dans le plan de l'image - pas rotation.y qui
 * pivoterait le livre en profondeur) du seul premier voisin de chaque côté,
 * comme s'il penchait dans l'espace laissé par le livre désigné jusqu'à
 * sembler reposer sur le suivant (voir pushedTilts). Un livre a une vraie
 * épaisseur (BOOK.t) : le faire pivoter sur l'axe Y pour ce même effet
 * révèle un coin de ses plats de couverture (un losange), pas le simple
 * penché à plat de la référence - d'où ce roulis en façade plutôt qu'un
 * pivot en profondeur. Les voisins au-delà restent droits, non déplacés par
 * ce blanc. Même angle des deux côtés (No Finder vers À venir, No Finder
 * vers Old Knight) : un angle plus marqué à gauche a été tenté, mais son
 * empiètement (le haut du livre penché, pied ancré, voir groundedPose)
 * imposait soit un écart qui poussait Old Knight hors cadre - et hors de
 * portée du clic - soit un passage devant lui une fois rapproché.
 */
const FAN_TILT_ANGLE_Z = (5 * Math.PI) / 180;

/**
 * Rang de chaque livre non désigné, en éventail de part et d'autre du livre
 * désigné (rang 0) : 1 pour le premier voisin de chaque côté, 2 pour le
 * suivant, etc. Sert à graduer aussi bien l'écart (pushedPositions) que la
 * rotation (pushedRotations) selon la distance au livre désigné.
 */
function bookRanks(count: number, selectedIndex: number): number[] {
  const ranks = new Array<number>(count).fill(0);
  for (const sign of [1, -1] as const) {
    const indices =
      sign === 1
        ? Array.from({ length: Math.max(0, count - selectedIndex - 1) }, (_, k) => selectedIndex + 1 + k)
        : Array.from({ length: Math.max(0, selectedIndex) }, (_, k) => selectedIndex - 1 - k);
    indices.forEach((i, k) => {
      ranks[i] = k + 1;
    });
  }
  return ranks;
}

/**
 * Abscisse de chaque livre non désigné, en éventail de part et d'autre du
 * livre désigné (toujours posé à x = 0) : le premier de chaque côté à
 * FIRST_NEIGHBOR_JEU_*, les suivants à NEXT_NEIGHBOR_JEU_* de sa couverture.
 */
function pushedPositions(count: number, selectedIndex: number): number[] {
  const positions = new Array<number>(count).fill(0);
  for (const sign of [1, -1] as const) {
    let edge = sign * (BOOK.w / 2); // bord du livre désigné, côté sign.
    let jeu = sign === 1 ? FIRST_NEIGHBOR_JEU_RIGHT : FIRST_NEIGHBOR_JEU_LEFT;
    const indices =
      sign === 1
        ? Array.from({ length: Math.max(0, count - selectedIndex - 1) }, (_, k) => selectedIndex + 1 + k)
        : Array.from({ length: Math.max(0, selectedIndex) }, (_, k) => selectedIndex - 1 - k);
    for (const i of indices) {
      const x = edge + sign * (jeu + BOOK.t / 2);
      positions[i] = x;
      edge = x + sign * (BOOK.t / 2);
      jeu = sign === 1 ? NEXT_NEIGHBOR_JEU_RIGHT : NEXT_NEIGHBOR_JEU_LEFT;
    }
  }
  return positions;
}

/**
 * Angle (rotation.y, en profondeur) de chaque livre : 0 pour le désigné
 * (couverture face caméra), Math.PI / 2 pour tous les autres (tranche à
 * plat) - le penché des voisins n'est plus porté par cet axe (voir
 * pushedTilts, rotation.z) pour ne pas révéler leurs plats de couverture.
 */
function pushedRotations(count: number, selectedIndex: number): number[] {
  const ranks = bookRanks(count, selectedIndex);
  return ranks.map((rank) => (rank === 0 ? 0 : Math.PI / 2));
}

/**
 * Inclinaison (rotation.z) de chaque livre non désigné : seul le premier
 * voisin de chaque côté penche, du côté opposé au livre désigné - comme s'il
 * s'affaissait dans l'espace laissé par lui jusqu'à sembler reposer sur le
 * suivant. Les voisins au-delà restent droits (0), non déplacés par ce
 * blanc. "À venir" (le dernier de l'étagère, voir comics.ts) fait toujours
 * exception : le panneau d'info est posé juste à sa droite (refreshCardGap
 * dans ShelfShell), et un penché y empiéterait - il reste donc droit même
 * en rang 1, qu'il ait ou non un second voisin sur qui reposer.
 */
function pushedTilts(count: number, selectedIndex: number): number[] {
  const ranks = bookRanks(count, selectedIndex);
  return nodesSigns(count, selectedIndex).map((sign, i) =>
    ranks[i] === 1 && i !== count - 1 ? -sign * FAN_TILT_ANGLE_Z : 0,
  );
}

/** Côté (1 = à droite, -1 = à gauche, 0 = le désigné lui-même) de chaque livre. */
function nodesSigns(count: number, selectedIndex: number): number[] {
  return Array.from({ length: count }, (_, i) =>
    i === selectedIndex ? 0 : i > selectedIndex ? 1 : -1,
  );
}

/**
 * Position (x, y) du groupe d'un livre penché (rotation.z = tiltZ) pour que
 * son pied reste posé au sol (y = 0) à l'abscisse x visée, plutôt que de
 * pivoter sur son centre (l'origine du groupe, voir group.position.set plus
 * bas) - ce qui ferait plonger son bas sous l'étagère et son haut s'envoler
 * au-dessus, au lieu de sembler s'appuyer sur le voisin. Un livre droit
 * (tiltZ = 0) retombe exactement sur (x, BOOK.h / 2), la pose d'avant.
 */
function groundedPose(x: number, tiltZ: number): { x: number; y: number } {
  const halfH = BOOK.h / 2;
  return { x: x - halfH * Math.sin(tiltZ), y: halfH * Math.cos(tiltZ) };
}
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
 * Décalage de la caméra (et de sa cible, pour ne pas l'incliner) au repos de
 * l'étagère : la déplacer vers la droite (x positif) fait paraître tout ce
 * qui reste à x = 0 - la composition livre désigné + tranche écartée -
 * décalé vers la GAUCHE du canevas, qui occupe maintenant toute la largeur
 * de la page (voir ShelfShell). Ça laisse un espace vide à droite, pour un
 * troisième livre à venir, plutôt que de centrer exactement les deux livres
 * actuels.
 */
const SHELF_CENTER_X = 0.55;
const OPEN_ANGLE = -2.3;
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
  dispose(): void;
};

type BookNode = {
  group: THREE.Group;
  pick: THREE.Mesh;
  coverPivot: THREE.Group;
  spineMaterial: THREE.MeshBasicMaterial;
  coverMaterial: THREE.MeshBasicMaterial;
  firstPlateMaterial: THREE.MeshBasicMaterial;
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

  renderer.setPixelRatio(pixelRatio());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#15161b");

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 50);
  camera.position.set(SHELF_CENTER_X, BOOK.h * 0.55, 3.4);
  const camTarget = new THREE.Vector3(SHELF_CENTER_X, BOOK.h * 0.5, 0);

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
    const restX = (i - (comics.length - 1) / 2) * (BOOK.t + GAP);

    const group = new THREE.Group();
    // Ordre Z-Y-X (pas XYZ par défaut) : rotation.z (le penché, voir
    // pushedTilts) doit s'appliquer en dernier, autour de l'axe caméra fixe -
    // pas en premier, dans le repère d'origine du livre, où il finirait
    // recomposé par le yaw (rotation.y) en un pivot en profondeur au lieu
    // d'un simple roulis en façade.
    group.rotation.order = "ZYX";
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

    const back = new THREE.Mesh(plateGeo, boardsMat);
    back.position.set(0, 0, -(BOOK.t / 2 - COVER_T / 2) + 0.001);
    back.castShadow = true;
    group.add(back);

    // L'ordre des matériaux d'une BoxGeometry est [+X, -X, +Y, -Y, +Z, -Z].
    const spine = new THREE.Mesh(spineGeo, [
      boardsMat,
      spineMaterial,
      boardsMat,
      boardsMat,
      boardsMat,
      boardsMat,
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
      boardsMat,
      boardsMat,
      boardsMat,
      boardsMat,
      coverMaterial,
      boardsMat,
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
      restX,
      comic,
      coverLoaded: false,
    });

    if (comic.spine) {
      loader.load(comic.spine, (tex) => {
        if (disposed) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
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
   */
  function showPlate(
    material: THREE.MeshStandardMaterial,
    url: string | null,
    texture: THREE.Texture | null,
  ) {
    if (url !== null && texture === null) return;
    material.map = texture;
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
    readingSpreads = buildSpreads(node.comic.plates);
    readingIndex = clampSpreadIndex(spread, readingSpreads.length);

    node.group.add(readingGroup);
    node.coverPivot.add(leftPage);
    readingGroup.visible = false;
    leftPage.visible = false;
    applyReadingLighting(true);
    turnPage.setVisible(false);

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
    const index = pickIndex(event);
    if (index !== null) opts.onPick(index);
    else opts.onDismiss();
  }

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);

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
   * livre vers la caméra et d'écarter l'autre, à côté, jamais par-dessus. Le
   * gros plan (SELECT_OUT + zoom caméra) est réservé à l'ouverture (open /
   * openForReading), pas à la simple désignation. Elle ramène en revanche
   * toujours la caméra à sa distance de repos (3.4) : c'est désormais le seul
   * point d'entrée du repos de l'étagère, un livre y étant toujours désigné
   * (voir exit() dans ShelfShell, qui l'appelle au lieu de désélectionner).
   */
  async function select(index: number, animate: boolean): Promise<void> {
    selected = index;
    void ensureCover(nodes[index]);
    const xs = pushedPositions(nodes.length, index);
    const rots = pushedRotations(nodes.length, index);
    const tilts = pushedTilts(nodes.length, index);

    // La désignation suit la pose engagée dès l'appel : elle ne doit jamais
    // dépendre d'un soulèvement de survol en cours.
    nodes.forEach((node, i) => {
      if (i === index) {
        setPickPose(node.pick, 0, BOOK.h / 2, HOVER_OUT, 0);
      } else {
        const pose = groundedPose(xs[i], tilts[i]);
        setPickPose(node.pick, pose.x, pose.y, SPINE_REST_Z, rots[i]);
      }
    });

    const d = animate ? dur(900) : 0;
    const tl = timeline();
    tl.to(camera.position, { x: SHELF_CENTER_X, y: BOOK.h * 0.55, z: 3.4, duration: d }, 0);
    tl.to(camTarget, { x: SHELF_CENTER_X, duration: d }, 0);

    nodes.forEach((node, i) => {
      if (i === index) {
        tl.to(node.group.position, { x: 0, y: BOOK.h / 2, z: HOVER_OUT, duration: d }, 0).to(
          node.group.rotation,
          { y: 0, z: 0, duration: d },
          0,
        );
      } else {
        const pose = groundedPose(xs[i], tilts[i]);
        tl.to(
          node.group.position,
          { x: pose.x, y: pose.y, z: SPINE_REST_Z, duration: d },
          0,
        ).to(node.group.rotation, { y: rots[i], z: tilts[i], duration: d }, 0);
      }
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
    };
    if (readingNode === null) stow();

    const tl = gsap.timeline({
      onUpdate: () => {
        if (node.coverPivot.rotation.y > READ_OPEN_ANGLE / 2) stow();
        markDirty();
      },
    });
    if (animate && !opts.reducedMotion) {
      tl.to(
        camera.position,
        { x: SHELF_CENTER_X, z: 3.4 - 0.6, y: BOOK.h * 0.55, duration: dur(1000), ease: "power2.out" },
        0,
      )
        .to(camTarget, { x: SHELF_CENTER_X, y: BOOK.h * 0.5, z: 0, duration: dur(1000) }, 0)
        .to(camera, { fov: 45, duration: dur(1000), onUpdate: () => camera.updateProjectionMatrix() }, 0)
        .to(
          key.position,
          { x: KEY_SHELF.x, y: KEY_SHELF.y, z: KEY_SHELF.z, duration: dur(1000) },
          0,
        );
    } else {
      camera.position.set(SHELF_CENTER_X, BOOK.h * 0.55, 3.4 - 0.6);
      camTarget.set(SHELF_CENTER_X, BOOK.h * 0.5, 0);
      camera.fov = 45;
      camera.updateProjectionMatrix();
      key.position.copy(KEY_SHELF);
    }
    tl.to(
      node.coverPivot.rotation,
      { y: 0, duration: animate ? dur(900) : 0, ease: "power2.inOut" },
      animate ? dur(300) : 0,
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
    selected = index;
    void ensureCover(nodes[index]);
    const xs = pushedPositions(nodes.length, index);
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

  /** Voir SceneHandle.contentRightEdge. */
  function contentRightEdge(): number {
    const box = new THREE.Box3();
    for (const node of nodes) box.expandByObject(node.group);
    const w = canvas.clientWidth || window.innerWidth;
    // updateMatrixWorld: .project() lit la matrice caméra telle qu'elle était au
    // dernier rendu, qui peut dater d'avant le dernier déplacement des livres.
    camera.lookAt(camTarget);
    camera.updateMatrixWorld();
    let maxPx = 0;
    const corner = new THREE.Vector3();
    for (const x of [box.min.x, box.max.x]) {
      for (const y of [box.min.y, box.max.y]) {
        for (const z of [box.min.z, box.max.z]) {
          corner.set(x, y, z).project(camera);
          maxPx = Math.max(maxPx, ((corner.x + 1) / 2) * w);
        }
      }
    }
    return maxPx;
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
    dispose() {
      disposed = true;
      killOurTweens();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      returnFirstPlate();
      stopReading();
      turnPage.dispose();
      readerPageGeo.dispose();
      [leftPageMaterial, rightPageMaterial].forEach((m) => m.dispose());
      [pagesGeo, plateGeo, spineGeo, pickGeo, wallGeo].forEach((g) => g.dispose());
      [pagesMat, boardsMat, pickMat, wallMat].forEach((m) => m.dispose());
      nodes.forEach((n) => {
        n.spineMaterial.map?.dispose();
        n.coverMaterial.map?.dispose();
        n.firstPlateMaterial.map?.dispose();
        n.spineMaterial.dispose();
        n.coverMaterial.dispose();
        n.firstPlateMaterial.dispose();
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
