import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

/**
 * Cursor
 */
const cursor = {
  x: 0,
  y: 0,
};

canvas.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = -(e.clientY / sizes.height - 0.5);
  // console.log(cursor);
});

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Scene
const scene = new THREE.Scene();

// Object
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(mesh);

// Camera
const Pcam = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  // 3,
  0.1,
  100
);
Pcam.position.set(0, 0, 2);
Pcam.lookAt(mesh.position);
scene.add(Pcam);

const aspectRatio = sizes.width / sizes.height;
const ortho = new THREE.OrthographicCamera(
  -1 * aspectRatio,
  1 * aspectRatio,
  1,
  -1
);
ortho.position.set(0, 0, 2);
ortho.lookAt(mesh.position);
scene.add(ortho);

const AMOUNT = 2;
let arrayCam;
initCameras();

function initCameras() {
  const cameras = [];
  const WIDTH = (sizes.width / AMOUNT) * window.devicePixelRatio;
  const HEIGHT = (sizes.height / AMOUNT) * window.devicePixelRatio;
  for (let y = 0; y < AMOUNT; y++) {
    for (let x = 0; x < AMOUNT; x++) {
      const subcamera = new THREE.PerspectiveCamera(40, aspectRatio, 0.1, 10);
      subcamera.viewport = new THREE.Vector4(
        Math.floor(x * WIDTH),
        Math.floor(y * HEIGHT),
        Math.ceil(WIDTH),
        Math.ceil(HEIGHT)
      );
      subcamera.position.x = x / AMOUNT - 0.5;
      subcamera.position.y = 0.5 - y / AMOUNT;
      subcamera.position.z = 1.5;
      subcamera.position.multiplyScalar(2);
      subcamera.lookAt(mesh.position);
      subcamera.updateMatrixWorld();
      cameras.push(subcamera);
    }
  }
  arrayCam = new THREE.ArrayCamera(cameras);
  arrayCam.position.set(0, 0, 3);
  scene.add(arrayCam);
}

// Controls
const controls = new OrbitControls(Pcam, canvas);
controls.enableDamping = true;
// controls.dampingFactor = 0.25;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  // mesh.rotation.y = elapsedTime;

  // update camera
  // Pcam.position.x = cursor.x * 2;
  // Pcam.position.y = cursor.y * 2;

  // Pcam.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
  // Pcam.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
  // Pcam.position.y = cursor.y * 5;
  // Pcam.lookAt(mesh.position);

  controls.update();

  // Render
  renderer.render(scene, Pcam);
  // renderer.render(scene, ortho);
  // renderer.render(scene, arrayCam);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
