import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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
 * Lights
 */
// Ambient light
const ambientLightFolder = gui.addFolder("Ambient light");
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
ambientLightFolder.add(ambientLight, "intensity").min(0).max(3).step(0.001);
ambientLightFolder.close();
scene.add(ambientLight);

// Directional light
const directionalLightFolder = gui.addFolder("Directional light");
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(2, 2, -1);
directionalLightFolder.add(directionalLight, "intensity", 0, 3, 0.001);
directionalLightFolder.add(directionalLight.position, "x", -5, 5, 0.001);
directionalLightFolder.add(directionalLight.position, "y", -5, 5, 0.001);
directionalLightFolder.add(directionalLight.position, "z", -5, 5, 0.001);
directionalLightFolder.close();

scene.add(directionalLight);

/**
 * Materials
 */
const materialFolder = gui.addFolder("Material");
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
materialFolder.add(material, "metalness", 0, 1, 0.001);
materialFolder.add(material, "roughness", 0, 1, 0.001);
materialFolder.close();

/**
 * Objects
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;

scene.add(sphere, plane);

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
  sphere.rotation.y = elapsedTime * 0.5;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
});
