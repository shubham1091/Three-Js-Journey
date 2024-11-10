import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

/**
 * Loaders
 */

const gltflLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Base
 */
// Debug
const gui = new GUI();
const global = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Update all materials
 */

const updateMaterials = () => {
  scene.traverse((child) => {
    // console.log(child);
    if (child.isMesh && child.material instanceof THREE.MeshStandardMaterial) {
      // console.log(child);
      child.material.envMapIntensity = global.envMapIntensity;
    }
  });
};

/**
 * Environment map
 */
scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;

gui.add(scene, "backgroundBlurriness", 0, 1, 0.01);
gui.add(scene, "backgroundIntensity", 0, 10, 0.01);
// LDR cube texture
let envIdx = 0;
global.envMapIntensity = 1;
gui.add(global, "envMapIntensity", 0, 10, 0.01).onChange(() => {
  // envIdx = Math.floor(value);
  updateMaterials();
});
// const envMap = cubeTextureLoader.load([
//   `/environmentMaps/${envIdx}/px.png`,
//   `/environmentMaps/${envIdx}/nx.png`,
//   `/environmentMaps/${envIdx}/py.png`,
//   `/environmentMaps/${envIdx}/ny.png`,
//   `/environmentMaps/${envIdx}/pz.png`,
//   `/environmentMaps/${envIdx}/nz.png`,
// ]);

// scene.background = envMap;
// scene.environment = envMap;

// HDR (rgbe) equirectangular environment map

// rgbeLoader.load(`/environmentMaps/${envIdx}/2k.hdr`, (en) => {
//   // console.log(en);
//   en.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = en;
//   scene.environment = en;
//   // updateMaterials();
// });
// rgbeLoader.load(`/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg`, (en) => {
//   // console.log(en);
//   en.mapping = THREE.EquirectangularReflectionMapping;
//   // scene.background = en;
//   scene.environment = en;
//   // updateMaterials();
// });

// LDR equirectangular environment map

const envMap = textureLoader.load(`/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg`)
envMap.mapping = THREE.EquirectangularReflectionMapping;
envMap.colorSpace = THREE.SRGBColorSpace;
scene.background = envMap;
scene.environment = envMap;

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({
    roughness: 0.3,
    metalness: 1,
    color: 0xaaaaaaa,
  })
);
torusKnot.position.y = 4;
torusKnot.position.x = -4;
scene.add(torusKnot);

/**
 * Models
 */
gltflLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  // console.log("loaded");

  gltf.scene.scale.set(10, 10, 10);
  scene.add(gltf.scene);
  updateMaterials();
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 5, 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
