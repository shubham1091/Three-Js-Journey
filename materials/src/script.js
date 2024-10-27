import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import GUI from "lil-gui";

const gui = new GUI();
gui.title("Debug panel");

const parameters = {};

/**
 * Textures
 */
const lodingManager = new THREE.LoadingManager();
lodingManager.onStart = (_, loaded, total) => {
  console.log(`starting to load: ${((loaded / total) * 100).toFixed(2)}%`);
};
lodingManager.onLoad = () => {
  console.log("Loading complete!");
};
lodingManager.onProgress = (url, loaded, total) => {
  console.info(`Loading: ${url} - ${((loaded / total) * 100).toFixed(2)}%`);
};
lodingManager.onError = (url) => {
  console.error(`An error happened while loading: ${url}`);
};
const textureLoader = new THREE.TextureLoader(lodingManager);

const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg"
);
const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
doorColorTexture.colorSpace = THREE.SRGBColorSpace;

const matcapTexture = textureLoader.load("/textures/matcaps/3.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Light
 */
const lightFolder = gui.addFolder("Light");

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
const pointLight = new THREE.PointLight(0xffffff, 30);
pointLight.position.set(2, 3, 4);
lightFolder.add(ambientLight, "intensity").min(0).max(2).step(0.01);
lightFolder.add(pointLight, "intensity").min(0).max(100).step(1);
scene.add(ambientLight, pointLight);

/**
 * Environment map
 */

const rgbeLoader = new RGBELoader();
rgbeLoader.load("/textures/environmentMap/2k.hdr", (envMap) => {
  // console.log(envMap);
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
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

camera.position.set(0, 0, 2);
scene.add(camera);

/**
 * Material
 */
// const materialFolder = gui.addFolder("Material");
/* meshBasicMaterial */
// const material = new THREE.MeshBasicMaterial({
//   map: doorColorTexture,
//   color: 0xff0000,
//   wireframe: true,
//   opacity: 0.2,
//   transparent: true,
//   alphaMap: doorAlphaTexture,
//   side: THREE.DoubleSide,
// });

/* meshNormalMaterial */
// const material = new THREE.MeshNormalMaterial();

/* meshMatcapMaterial */
// const material  = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });

/* meshPhongMaterial */
// const material = new THREE.MeshDepthMaterial()

/* meshLambertMaterial */
//const material = new THREE.MeshLambertMaterial();

/* meshPhongMaterial */
// const material = new THREE.MeshPhongMaterial({
//   shininess: 100,
//   color: 0x1188ff,
// });

/* meshToonMaterial */
// const material = new THREE.MeshToonMaterial({gradientMap: gradientTexture});

/* meshStandardMaterial */
// const material = new THREE.MeshStandardMaterial({
//   map: doorColorTexture,
//   roughnessMap: doorRoughnessTexture,
//   displacementMap: doorHeightTexture,
//   displacementScale: 0.05,
//   metalnessMap: doorMetalnessTexture,
//   normalMap: doorNormalTexture,
//   aoMap: doorAmbientOcclusionTexture,
//   alphaMap: doorAlphaTexture,
//   transparent: true,
// });

/* meshPhysicalMaterial */
const material = new THREE.MeshPhysicalMaterial({
  aoMap: doorAmbientOcclusionTexture,
  map: doorColorTexture,
  displacementMap: doorHeightTexture,
  normalMap: doorNormalTexture,
  roughnessMap: doorRoughnessTexture,
  metalnessMap: doorMetalnessTexture,
  alphaMap: doorAlphaTexture,
  clearcoat: 0.5,
  clearcoatRoughness: 0,
  displacementScale: 0.05,
  transparent: true,
  sheen: 1,
  sheenRoughness: 0.25,
  sheenColor: 0xffffff,
});

/**
 * Geometry
 */
const sphereGeometry = new THREE.SphereGeometry(0.5, 64, 64);
const planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100);
const torusGeometry = new THREE.TorusGeometry(0.3, 0.2, 64, 64);

const sphere = new THREE.Mesh(sphereGeometry, material);

const plane = new THREE.Mesh(planeGeometry, material);
plane.position.set(-1.5, 0, 0);

const torus = new THREE.Mesh(torusGeometry, material);
torus.position.set(1.5, 0, 0);

const Mesh = [sphere, plane, torus];

scene.add(sphere, plane, torus);

// Controls
const controls = new OrbitControls(camera, canvas);
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
  const elapsedTime = clock.getElapsedTime();

  Mesh.forEach((mesh) => {
    // mesh.rotation.reorder("YXZ");
    // mesh.rotation.set(elapsedTime * 0.1, 0, 0);
    mesh.rotation.y = elapsedTime * 0.1;
  });

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
});
