import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

/**
 * Base
 */
// Debug
const gui = new GUI();

const debugObject = {
  animation: 0,
  changeAnimation: () => {
    debugObject.animation = (debugObject.animation + 1) % 3;
    mixer.stopAllAction();
    mixer.clipAction(clips[debugObject.animation]).play();
  },
};
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
// dracoLoader.setDecoderPath("three/addons/libs/draco/"); // for some reason this doesn't work
dracoLoader.preload();

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
let mixer = new THREE.AnimationMixer();
let clips = [];
gui.add(debugObject, "changeAnimation").onFinishChange(() => {
  // console.log(debugObject.animation)
  mixer.stopAllAction();
  // console.log(clips);

  mixer.clipAction(clips[debugObject.animation]).play();
});

gltfLoader.load(
  "/models/Fox/glTF/Fox.gltf",
  (gltf) => {
    // console.log(gltf);
    mixer = new THREE.AnimationMixer(gltf.scene);

    clips = gltf.animations;
    mixer.clipAction(gltf.animations[debugObject.animation]).play();

    gltf.scene.scale.set(0.025, 0.025, 0.025);
    scene.add(gltf.scene);
    // scene.add(...gltf.scene.children);

    console.log("Model loaded");
  },
  () => {
    console.log("loading model");
  },
  () => {
    "Error loading model";
  }
);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshNormalMaterial()
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearAlpha(0);

/**
 * Animate
 */
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  controls.update();
  mixer.update(clock.getDelta());
  renderer.render(scene, camera);
});
