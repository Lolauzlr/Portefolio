import * as THREE from "three";

const SEGMENTS = 24;
/** Amplitude de cambrure, en unités de scène, à mi-course. */
const MAX_BEND = 0.09;

export type TurnPage = {
  pivot: THREE.Group;
  setProgress(t: number): void;
  setFaces(front: THREE.Texture | null, back: THREE.Texture | null): void;
  setVisible(v: boolean): void;
  dispose(): void;
};

/** Injecte la cambrure dans un shader : la page se courbe, elle ne se plie pas. */
function bendVertex(shader: { vertexShader: string }) {
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform float uBend;
       uniform float uWidth;`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       transformed.z += sin(3.14159265 * (position.x / uWidth)) * uBend;`,
    );
}

/** `gutter` reprend le creux d'éclairement des pages fixes, que la feuille recouvre. */
export function createTurnPage(width: number, height: number, gutter: number): TurnPage {
  // La géométrie est décalée pour que x aille de 0 à width : la charnière est en x = 0,
  // donc la rotation du pivot fait tourner la page sur sa reliure et non sur son centre.
  const geometry = new THREE.PlaneGeometry(width, height, SEGMENTS, 1);
  geometry.translate(width / 2, 0, 0);

  const uniforms = {
    uBend: { value: 0 },
    uWidth: { value: width },
    uFront: { value: null as THREE.Texture | null },
    uBack: { value: null as THREE.Texture | null },
    uHasFront: { value: 0 },
    uHasBack: { value: 0 },
    // Le crème du papier est porté par la couleur du matériau, comme sur les pages
    // fixes : la planche y est teintée de la même façon. Une page nue garde ce crème.
    uPaper: { value: new THREE.Color(0xffffff) },
    uGutter: { value: gutter },
  };

  const material = new THREE.MeshStandardMaterial({
    color: 0xefe7d6,
    side: THREE.DoubleSide,
    roughness: 0.95,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = uniforms.uBend;
    shader.uniforms.uWidth = uniforms.uWidth;
    shader.uniforms.uFront = uniforms.uFront;
    shader.uniforms.uBack = uniforms.uBack;
    shader.uniforms.uHasFront = uniforms.uHasFront;
    shader.uniforms.uHasBack = uniforms.uHasBack;
    shader.uniforms.uPaper = uniforms.uPaper;
    shader.uniforms.uGutter = uniforms.uGutter;
    bendVertex(shader);

    // La charnière est en x = 0 aux deux extrémités du geste : le même creux que sur
    // les pages fixes vaut donc dans les deux sens, sans raccord à la pose d'arrivée.
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform float uGutter;
         varying float vGutterShade;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float gutterU = clamp(1.0 - position.x / uWidth, 0.0, 1.0);
         vGutterShade = 1.0 - uGutter * gutterU * gutterU;`,
      );

    // Recto et verso portent deux planches différentes : gl_FrontFacing les départage,
    // et le verso est retourné horizontalement, comme une vraie feuille.
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform sampler2D uFront;
         uniform sampler2D uBack;
         uniform float uHasFront;
         uniform float uHasBack;
         uniform vec3 uPaper;
         varying float vGutterShade;`,
      )
      .replace(
        "#include <map_fragment>",
        `vec3 pageColor = uPaper;
         if (gl_FrontFacing && uHasFront > 0.5) {
           pageColor = texture2D(uFront, vMapUv).rgb;
         } else if (!gl_FrontFacing && uHasBack > 0.5) {
           pageColor = texture2D(uBack, vec2(1.0 - vMapUv.x, vMapUv.y)).rgb;
         }
         diffuseColor.rgb *= pageColor * vGutterShade;`,
      );
  };
  // Sans cette clé, three réutiliserait un programme compilé pour un autre matériau.
  material.customProgramCacheKey = () => "comics-turn-page";

  // L'ombre ignore une déformation faite dans le shader de la matière : sans ce
  // matériau de profondeur portant la même cambrure, une page courbée projette
  // une ombre plate.
  const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
  });
  depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = uniforms.uBend;
    shader.uniforms.uWidth = uniforms.uWidth;
    bendVertex(shader);
  };
  depthMaterial.customProgramCacheKey = () => "comics-turn-page-depth";

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.customDepthMaterial = depthMaterial;
  // Sans map assignée, three ne déclare pas vMapUv et le shader ne compilerait pas.
  // Une texture blanche d'un pixel suffit à l'obtenir sans rien peindre.
  const uvAnchor = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  uvAnchor.needsUpdate = true;
  material.map = uvAnchor;

  const pivot = new THREE.Group();
  pivot.add(mesh);
  pivot.visible = false;

  return {
    pivot,

    setProgress(t: number) {
      const clamped = Math.min(Math.max(t, 0), 1);
      pivot.rotation.y = -Math.PI * clamped;
      uniforms.uBend.value = Math.sin(Math.PI * clamped) * MAX_BEND;
    },

    setFaces(front, back) {
      uniforms.uFront.value = front;
      uniforms.uBack.value = back;
      uniforms.uHasFront.value = front ? 1 : 0;
      uniforms.uHasBack.value = back ? 1 : 0;
    },

    setVisible(v: boolean) {
      pivot.visible = v;
    },

    dispose() {
      geometry.dispose();
      uvAnchor.dispose();
      material.dispose();
      depthMaterial.dispose();
    },
  };
}
