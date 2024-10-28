import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Axis helper
 */
const axesHelper = new THREE.AxesHelper();
gui.add(axesHelper, "visible").name("AxesHelper");
scene.add(axesHelper);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Fonts
 */
const fontLoader = new FontLoader();

fontLoader.load("/font/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Hello world", {
    font,
    size: 0.5,
    height: 0.1,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
  });
  // textGeometry.computeBoundingBox();
  // textGeometry.translate(
  //   -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
  //   -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
  //   -(textGeometry.boundingBox.max.z - 0.03) * 0.5
  // );
  textGeometry.center();
  const matcap = textureLoader.load("/textures/matcaps/3.png");
  matcap.colorSpace = THREE.SRGBColorSpace;

  const textMaterial = new THREE.MeshMatcapMaterial({ map: matcap });

  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(textMesh);
  console.log("Font loaded");
});

/**
 * Object
 */

// const geometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
const geometry = new THREE.IcosahedronGeometry(0.3);
const material = new THREE.MeshNormalMaterial();
console.time("mesh");
const arr = [];
for (let i = 0; i < 100; i++) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );

  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;

  const randomeSize = Math.random();
  mesh.scale.set(randomeSize, randomeSize, randomeSize);
  arr.push(mesh);
}
scene.add(...arr);
console.timeEnd("mesh");

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
camera.position.set(1, 1, 2);
scene.add(camera);

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
  arr.forEach((mesh) => {
    mesh.rotation.y = elapsedTime
  });

  controls.update();
  renderer.render(scene, camera);
});
