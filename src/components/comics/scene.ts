import { gsap } from "gsap";
import * as THREE from "three";
import type { Comic } from "@/lib/comics";
import {
  headingFontFamily,
  loadCoverTexture,
  paintUpcomingSpine,
  pickTextureWidth,
} from "@/components/comics/textures";

const BOOK = { w: 1.02, h: 1.5, t: 0.26 };
const COVER_T = 0.022;
const GAP = 0.012;
const HOVER_OUT = 0.09;
const SELECT_OUT = 0.9;
const OPEN_ANGLE = -2.3;

export type SceneOptions = {
  reducedMotion: boolean;
  onHoverChange: (index: number | null) => void;
  onPick: (index: number) => void;
  onDismiss: () => void;
};

export type SceneHandle = {
  setHover(index: number | null): void;
  select(index: number, animate: boolean): Promise<void>;
  deselect(animate: boolean): Promise<void>;
  open(animate: boolean): Promise<void>;
  close(animate: boolean): Promise<void>;
  enterImmediate(index: number): void;
  setPickingEnabled(enabled: boolean): void;
  setVisible(visible: boolean): void;
  renderOnce(): void;
  resize(): void;
  dispose(): void;
};

type BookNode = {
  group: THREE.Group;
  pick: THREE.Mesh;
  coverPivot: THREE.Group;
  spineMaterial: THREE.MeshStandardMaterial;
  coverMaterial: THREE.MeshStandardMaterial;
  restX: number;
  comic: Comic;
  coverLoaded: boolean;
};

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#15161b");

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 50);
  camera.position.set(0, BOOK.h * 0.55, 3.4);
  const camTarget = new THREE.Vector3(0, BOOK.h * 0.5, 0);

  // --- environnement -------------------------------------------------------
  const span = comics.length * (BOOK.t + GAP);

  const wallGeo = new THREE.PlaneGeometry(20, 12);
  const wallMat = new THREE.MeshStandardMaterial({ color: "#15161b", roughness: 1 });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 2, -1.2);
  wall.receiveShadow = false;
  scene.add(wall);

  const boardGeo = new THREE.BoxGeometry(span + 1.2, 0.12, 0.72);
  const boardMat = new THREE.MeshStandardMaterial({
    color: "#22242b",
    roughness: 0.42,
    metalness: 0.55,
  });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0, -0.06, 0);
  board.receiveShadow = true;
  scene.add(board);

  scene.add(new THREE.AmbientLight(0xffffff, 0.18));

  const key = new THREE.SpotLight(0xfff4e6, 26, 14, Math.PI / 5, 0.55, 1.6);
  key.position.set(2.6, 3.4, 2.8);
  key.target.position.copy(camTarget);
  const bigSurface = window.innerWidth * window.innerHeight > 2_000_000;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  key.castShadow = !bigSurface && !coarse;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);

  const rim = new THREE.DirectionalLight(0x8fb6c0, 0.1);
  rim.position.set(-3, 1.6, 1.4);
  scene.add(rim);

  renderer.shadowMap.enabled = key.castShadow;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  // --- géométries partagées ------------------------------------------------
  const pagesGeo = new THREE.BoxGeometry(
    BOOK.w - COVER_T - 0.02,
    BOOK.h - 0.02,
    BOOK.t - 2 * COVER_T - 0.006,
  );
  const PLATE_INSET = 0.002;
  const plateGeo = new THREE.BoxGeometry(BOOK.w - 2 * PLATE_INSET, BOOK.h, COVER_T);
  const spineGeo = new THREE.BoxGeometry(COVER_T, BOOK.h, BOOK.t);
  const pickGeo = new THREE.BoxGeometry(BOOK.w, BOOK.h, BOOK.t);

  const pagesMat = new THREE.MeshStandardMaterial({ color: "#efe7d6", roughness: 0.95 });
  const boardsMat = new THREE.MeshStandardMaterial({ color: "#101216", roughness: 0.7 });
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
    group.rotation.y = Math.PI / 2; // le dos fait face à la caméra
    group.position.set(restX, BOOK.h / 2, 0);

    const spineMaterial = new THREE.MeshStandardMaterial({
      color: comic.spine ? 0xffffff : 0x1b1d22,
      roughness: 0.8,
    });
    const coverMaterial = new THREE.MeshStandardMaterial({
      color: comic.cover ? 0xffffff : 0x1b1d22,
      roughness: 0.75,
    });

    const pages = new THREE.Mesh(pagesGeo, pagesMat);
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
    }
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
      const lifted = i === index && selected === null;
      gsap.to(node.group.position, {
        z: lifted ? HOVER_OUT : selected === i ? SELECT_OUT : 0,
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
    const targets: object[] = [camera, camera.position, camTarget];
    for (const node of nodes) {
      targets.push(
        node.group.position,
        node.group.rotation,
        node.coverPivot.rotation,
        node.spineMaterial,
        node.coverMaterial,
      );
    }
    gsap.killTweensOf(targets);
  }

  function timeline() {
    return gsap.timeline({
      defaults: { ease: "power3.inOut", overwrite: "auto" },
      onUpdate: markDirty,
    });
  }

  async function select(index: number, animate: boolean): Promise<void> {
    selected = index;
    void ensureCover(nodes[index]);

    // La désignation suit la pose engagée dès l'appel : elle ne doit jamais
    // dépendre d'un soulèvement de survol en cours.
    nodes.forEach((node, i) => {
      if (i === index) {
        setPickPose(node.pick, 0, BOOK.h / 2 + 0.15, SELECT_OUT, 0);
      } else {
        const push = node.restX < nodes[index].restX ? -0.25 : 0.25;
        setPickPose(node.pick, node.restX + push, BOOK.h / 2, 0, Math.PI / 2);
      }
    });

    const d = animate ? dur(900) : 0;
    const tl = timeline();

    nodes.forEach((node, i) => {
      if (i === index) {
        tl.to(node.group.position, { x: 0, y: BOOK.h / 2 + 0.15, z: SELECT_OUT, duration: d }, 0)
          .to(node.group.rotation, { y: 0, duration: d }, 0)
          .to(node.spineMaterial, { opacity: 1, duration: d }, 0);
        node.coverMaterial.transparent = false;
        node.spineMaterial.transparent = false;
        tl.to(node.coverMaterial, { opacity: 1, duration: d }, 0);
      } else {
        const push = node.restX < nodes[index].restX ? -0.25 : 0.25;
        node.coverMaterial.transparent = true;
        node.spineMaterial.transparent = true;
        tl.to(
          node.group.position,
          { x: node.restX + push, y: BOOK.h / 2, z: 0, duration: d },
          0,
        )
          .to(node.group.rotation, { y: Math.PI / 2, duration: d }, 0)
          .to(node.spineMaterial, { opacity: 0.25, duration: d }, 0)
          .to(node.coverMaterial, { opacity: 0.25, duration: d }, 0);
      }
    });

    tl.to(camera.position, { z: 3.4 - 0.6, duration: d }, 0);
    await tl;
  }

  async function deselect(animate: boolean): Promise<void> {
    selected = null;

    // Toutes les désignations reviennent sur leur position de repos.
    nodes.forEach((node) => {
      setPickPose(node.pick, node.restX, BOOK.h / 2, 0, Math.PI / 2);
    });

    const d = animate ? dur(700) : 0;
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onUpdate: markDirty });
    nodes.forEach((node) => {
      tl.to(
        node.group.position,
        { x: node.restX, y: BOOK.h / 2, z: 0, duration: d },
        0,
      )
        .to(node.group.rotation, { y: Math.PI / 2, duration: d }, 0)
        .to(node.spineMaterial, { opacity: 1, duration: d }, 0)
        .to(node.coverMaterial, { opacity: 1, duration: d }, 0);
    });
    tl.to(camera.position, { z: 3.4, duration: d }, 0);
    await tl;
    nodes.forEach((n) => {
      n.spineMaterial.transparent = false;
      n.coverMaterial.transparent = false;
    });
  }

  async function open(animate: boolean): Promise<void> {
    if (selected === null) return;
    const node = nodes[selected];
    const tl = gsap.timeline({ onUpdate: markDirty });
    tl.to(
      node.coverPivot.rotation,
      { y: OPEN_ANGLE, duration: animate ? dur(1100) : 0, ease: "power2.inOut" },
      0,
    );
    if (animate && !opts.reducedMotion) {
      tl.to(
        camera.position,
        { z: SELECT_OUT + 0.16, y: BOOK.h * 0.52, duration: dur(1150), ease: "power2.in" },
        dur(250),
      )
        .to(camTarget, { y: BOOK.h * 0.44, z: -0.2, duration: dur(1150) }, dur(250))
        .to(camera, { fov: 58, duration: dur(1150), onUpdate: () => camera.updateProjectionMatrix() }, dur(250));
    } else {
      camera.position.set(0, BOOK.h * 0.52, SELECT_OUT + 0.16);
      camTarget.set(0, BOOK.h * 0.44, -0.2);
      camera.fov = 58;
      camera.updateProjectionMatrix();
    }
    await tl;
  }

  async function close(animate: boolean): Promise<void> {
    if (selected === null) return;
    const node = nodes[selected];
    const tl = gsap.timeline({ onUpdate: markDirty });
    if (animate && !opts.reducedMotion) {
      tl.to(camera.position, { z: 3.4 - 0.6, y: BOOK.h * 0.55, duration: dur(1000), ease: "power2.out" }, 0)
        .to(camTarget, { y: BOOK.h * 0.5, z: 0, duration: dur(1000) }, 0)
        .to(camera, { fov: 45, duration: dur(1000), onUpdate: () => camera.updateProjectionMatrix() }, 0);
    } else {
      camera.position.set(0, BOOK.h * 0.55, 3.4 - 0.6);
      camTarget.set(0, BOOK.h * 0.5, 0);
      camera.fov = 45;
      camera.updateProjectionMatrix();
    }
    tl.to(
      node.coverPivot.rotation,
      { y: 0, duration: animate ? dur(900) : 0, ease: "power2.inOut" },
      animate ? dur(300) : 0,
    );
    await tl;
  }

  function enterImmediate(index: number) {
    killOurTweens();
    selected = index;
    void ensureCover(nodes[index]);
    nodes.forEach((node, i) => {
      if (i === index) {
        setPickPose(node.pick, 0, BOOK.h / 2 + 0.15, SELECT_OUT, 0);
        node.group.position.set(0, BOOK.h / 2 + 0.15, SELECT_OUT);
        node.group.rotation.y = 0;
        node.coverPivot.rotation.y = OPEN_ANGLE;
      } else {
        const push = node.restX < nodes[index].restX ? -0.25 : 0.25;
        setPickPose(node.pick, node.restX + push, BOOK.h / 2, 0, Math.PI / 2);
        node.group.position.set(node.restX + push, BOOK.h / 2, 0);
        node.spineMaterial.transparent = true;
        node.spineMaterial.opacity = 0.25;
        node.coverMaterial.transparent = true;
        node.coverMaterial.opacity = 0.25;
      }
    });
    camera.position.set(0, BOOK.h * 0.52, SELECT_OUT + 0.16);
    camTarget.set(0, BOOK.h * 0.44, -0.2);
    camera.fov = 58;
    camera.updateProjectionMatrix();
    markDirty();
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Seule la projection est réécrite : les positions sont peut-être en cours d'animation.
    camera.updateProjectionMatrix();
    markDirty();
  }
  resize();

  return {
    setHover,
    select,
    deselect,
    open,
    close,
    enterImmediate,
    setPickingEnabled(enabled) {
      picking = enabled;
      if (!enabled && hovered !== null) {
        setHover(null);
        opts.onHoverChange(null);
      }
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
    dispose() {
      disposed = true;
      killOurTweens();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      [pagesGeo, plateGeo, spineGeo, pickGeo, boardGeo, wallGeo].forEach((g) => g.dispose());
      [pagesMat, boardsMat, pickMat, boardMat, wallMat].forEach((m) => m.dispose());
      nodes.forEach((n) => {
        n.spineMaterial.map?.dispose();
        n.coverMaterial.map?.dispose();
        n.spineMaterial.dispose();
        n.coverMaterial.dispose();
      });
      key.dispose();
      rim.dispose();
      renderer.dispose();
    },
  };
}
