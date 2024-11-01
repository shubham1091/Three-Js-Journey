import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Setup
 */
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const bakedShadow = textureLoader.load("/textures/bakedShadow.jpg");
const simpleShadow = textureLoader.load("/textures/simpleShadow.jpg");
const gui = new GUI({ width: 300 });

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(2, 2, -1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = Math.pow(2, 10);
directionalLight.shadow.mapSize.height = Math.pow(2, 10);
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;

directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;

const spotLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3);
spotLight.position.set(0, 2, 2);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = Math.pow(2, 10);
spotLight.shadow.mapSize.height = Math.pow(2, 10);
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;

const pointLight = new THREE.PointLight(0xffffff, 0.4);
pointLight.position.set(-1, 1, 0);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = Math.pow(2, 10);
pointLight.shadow.mapSize.height = Math.pow(2, 10);
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 2;
scene.add(ambientLight, directionalLight, spotLight, pointLight);

/**
 * Helpers
 */
const addHelper = (shadowHelper, label) => {
  shadowHelper.visible = false;
  scene.add(shadowHelper);
  // gui.add(helper, "visible").name(`${helper.type} Helper`);
  gui.add(shadowHelper, "visible").name(`${label} Helper`);
};
addHelper(
  new THREE.CameraHelper(directionalLight.shadow.camera),
  "Directional"
);
addHelper(new THREE.CameraHelper(spotLight.shadow.camera), "Spot");
addHelper(new THREE.CameraHelper(pointLight.shadow.camera), "Point");

/**
 * Light Controls
 */
const lightFolder = gui.addFolder("Lights");
const addLightControls = (light, label) => {
  const folder = lightFolder.addFolder(label);
  folder.add(light, "intensity", 0, 2, 0.01);
  folder.add(light.position, "x", -5, 5, 0.1);
  folder.add(light.position, "y", -5, 5, 0.1);
  folder.add(light.position, "z", -5, 5, 0.1);
  folder.close();
};
// addLightControls(ambientLight, "Ambient Light");

addLightControls(directionalLight, "Directional Light");
addLightControls(spotLight, "Spot Light");
addLightControls(pointLight, "Point Light");

/**
 * Material
 */
const material = new THREE.MeshStandardMaterial({
  roughness: 0.7,
  metalness: 0.5,
});
const materialFolder = gui.addFolder("Material");
materialFolder.add(material, "metalness", 0, 1, 0.01);
materialFolder.add(material, "roughness", 0, 1, 0.01);

/**
 * Objects
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.castShadow = true;
const plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;
plane.receiveShadow = true;
const sphereShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    alphaMap: simpleShadow,
    transparent: true,
    color: 0x000000,
  })
);
sphereShadow.rotation.x = -Math.PI * 0.5;
sphereShadow.position.y = plane.position.y + 0.01;
scene.add(sphere, plane, sphereShadow);

/**
 * Camera and Controls
 */
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 1, 2);
scene.add(camera);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animation Loop
 */
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime();
  sphere.position.set(
    Math.sin(elapsedTime) * 1.5,
    Math.abs(Math.sin(elapsedTime * 3)),
    Math.cos(elapsedTime) * 1.5
  );
  sphereShadow.position.set(
    sphere.position.x,
    sphereShadow.position.y,
    sphere.position.z
  );
  sphereShadow.material.opacity = (1 - sphere.position.y) * 0.5;
  controls.update();
  renderer.render(scene, camera);
});
