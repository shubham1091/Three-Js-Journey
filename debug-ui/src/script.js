import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import GUI from "lil-gui";

const gui = new GUI({ width: 300, title: "Debug UI", closeFolders: true });
gui.close();

window.addEventListener("keydown", (e) => {
  if (e.key === "h") {
    gui.show(gui._hidden);
  }
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Object
 */
let debugObject = {};
debugObject.color = "#a778d8";
let geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
const material = new THREE.MeshBasicMaterial({ color: debugObject.color });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const cubeTweaks = gui.addFolder("Cube tweaks");

cubeTweaks.add(material, "wireframe").name("Wireframe");
cubeTweaks
  .addColor(debugObject, "color")
  .name("Color")
  .onChange(() => {
    material.color.set(debugObject.color);
  });
cubeTweaks.add(mesh.position, "y").min(-2).max(2).step(0.01).name("Elevation");

debugObject.animationId = null;
debugObject.spin = () => {
  const id = gsap.to(mesh.rotation, {
    y: Math.PI * 2,
    duration: 5,
    repeat: Infinity,
  });

  debugObject.animationId = id;
};

debugObject.stop = () => {
  debugObject.animationId && debugObject.animationId.kill();
};

cubeTweaks.add(debugObject, "spin").name("Spin the box");
cubeTweaks.add(debugObject, "stop").name("Stop the box");

debugObject.subdivisions = 2;
cubeTweaks
  .add(debugObject, "subdivisions")
  .min(1)
  .max(10)
  .step(1)
  .name("Subdivisions")
  .onFinishChange(() => {
    geometry.dispose();
    geometry = new THREE.BoxGeometry(
      1,
      1,
      1,
      debugObject.subdivisions,
      debugObject.subdivisions,
      debugObject.subdivisions
    );
    mesh.geometry = geometry;
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
camera.position.set(1, 1, 3);
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

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
});
