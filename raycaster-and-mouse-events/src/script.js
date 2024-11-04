import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object3.position.x = 2;

scene.add(object1, object2, object3);

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();
// const reayOrigin = new THREE.Vector3(-3, 0, 0);
// const rayDirection = new THREE.Vector3(10, 0, 0);
// // console.log(rayDirection.length());
// rayDirection.normalize();
// raycaster.set(reayOrigin, rayDirection);

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
 * cursor
 */
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("click", (e) => {
  if (currentIntersect) {
    console.log(`${currentIntersect.object.name} clicked`);
  }
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
camera.position.z = 3;
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
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.9);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#ffffff", 2.1);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

/**
 * Models
 */
const gltfLoader = new GLTFLoader();
let model = null;
gltfLoader.load("/models/Duck/glTF-Binary/Duck.glb", (gltf) => {
  model = gltf.scene;
  model.position.y = -1.2;
  scene.add(model);
});

/**
 * Animate
 */
const clock = new THREE.Clock();
const list = [object1, object2, object3];
list.forEach((item, idx) => {
  item.name = `object${idx + 1}`;
});
let currentIntersect = null;

renderer.setAnimationLoop(() => {
  //animate objects
  // object1.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 1.5;
  // object2.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 1.5;
  // object3.position.y = Math.sin(clock.getElapsedTime() * 1.4) * 1.5;
  list.forEach((item, idx) => {
    item.position.y = Math.sin(clock.getElapsedTime() * (idx + 1) * 0.3) * 1.5;
    item.material.color.set("#ff0000");
  });

  // // cast ray
  // const rayOrigin = new THREE.Vector3(-3, 0, 0);
  // const rayDirection = new THREE.Vector3(10, 0, 0);
  // rayDirection.normalize();
  // raycaster.set(rayOrigin, rayDirection);

  // const intersects = raycaster.intersectObjects(list);

  // list.forEach((item) => {
  //   item.material.color.set("#ff0000");
  // });
  // intersects.forEach((intersect) => {
  //   // console.log(intersect);
  //   intersect.object.material.color.set("#0000ff");
  // });

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(list);

  intersects.forEach((intersect) => {
    // console.log(intersect);
    intersect.object.material.color.set("#0000ff");
  });
  if (intersects.length) {
    if (!currentIntersect) {
      console.log("mouse enter");
    }
    currentIntersect = intersects[0];
  } else {
    if (currentIntersect) {
      console.log("mouse leave");
    }
    currentIntersect = null;
  }

  // model
  if (model) {
    const modelIntersects = raycaster.intersectObject(model);
    if (modelIntersects.length) {
      // console.log("model intersect");
      model.scale.set(1.1, 1.1, 1.1);
    } else {
      model.scale.set(1, 1, 1);
    }
  }

  // Update controls
  controls.update();

  // Update renderer
  renderer.render(scene, camera);
});
