import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug GUI
const gui = new GUI();
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
// Ambient Light
const ambientFolder = gui.addFolder("Ambient Light");
debugObject.ambientLightColor = 0xffffff;
const ambientLight = new THREE.AmbientLight(debugObject.ambientLightColor, 1.5);
ambientFolder.add(ambientLight, "intensity", 0, 2, 0.01).name("Intensity");
ambientFolder
  .addColor(debugObject, "ambientLightColor")
  .name("Color")
  .onChange(() => ambientLight.color.set(debugObject.ambientLightColor));
ambientFolder.close();
scene.add(ambientLight);

// Directional Light
const directionalFolder = gui.addFolder("Directional Light");
debugObject.directionalLightColor = 0x00fffc;
const directionalLight = new THREE.DirectionalLight(
  debugObject.directionalLightColor,
  0.5
);
directionalLight.position.set(1, 0.25, 0);
directionalFolder
  .add(directionalLight, "intensity", 0, 2, 0.01)
  .name("Intensity");
directionalFolder
  .addColor(debugObject, "directionalLightColor")
  .name("Color")
  .onChange(() =>
    directionalLight.color.set(debugObject.directionalLightColor)
  );
const directionalPositionFolder = directionalFolder.addFolder("Position");
directionalPositionFolder
  .add(directionalLight.position, "x", -10, 10, 0.01)
  .name("X");
directionalPositionFolder
  .add(directionalLight.position, "y", -10, 10, 0.01)
  .name("Y");
directionalPositionFolder
  .add(directionalLight.position, "z", -10, 10, 0.01)
  .name("Z");
directionalFolder.close();
scene.add(directionalLight);

// Hemisphere Light
const hemisphereFolder = gui.addFolder("Hemisphere Light");
debugObject.hemisphereLightOne = 0xff0000;
debugObject.hemisphereLightTwo = 0x0000ff;
const hemisphereLight = new THREE.HemisphereLight(
  debugObject.hemisphereLightOne,
  debugObject.hemisphereLightTwo,
  1
);
hemisphereFolder
  .addColor(debugObject, "hemisphereLightOne")
  .name("Sky Color")
  .onChange(() => hemisphereLight.color.set(debugObject.hemisphereLightOne));
hemisphereFolder
  .addColor(debugObject, "hemisphereLightTwo")
  .name("Ground Color")
  .onChange(() =>
    hemisphereLight.groundColor.set(debugObject.hemisphereLightTwo)
  );
hemisphereFolder.close();
scene.add(hemisphereLight);

// Point Light
const pointFolder = gui.addFolder("Point Light");
debugObject.pointLightColor = 0xff9000;
const pointLight = new THREE.PointLight(debugObject.pointLightColor, 1.5);
pointLight.position.set(1, -0.5, 1);
pointFolder.add(pointLight, "intensity", 0, 10, 0.01).name("Intensity");
pointFolder
  .addColor(debugObject, "pointLightColor")
  .name("Color")
  .onChange(() => pointLight.color.set(debugObject.pointLightColor));
const pointPositionFolder = pointFolder.addFolder("Position");
pointPositionFolder.add(pointLight.position, "x", -10, 10, 0.01).name("X");
pointPositionFolder.add(pointLight.position, "y", -10, 10, 0.01).name("Y");
pointPositionFolder.add(pointLight.position, "z", -10, 10, 0.01).name("Z");
pointFolder.close();
scene.add(pointLight);

// Rect Area Light
const rectAreaFolder = gui.addFolder("Rect Area Light");
const zero = new THREE.Vector3(0, 0, 0);
debugObject.rectAreaLightColor = 0x4e00ff;
const rectAreaLight = new THREE.RectAreaLight(
  debugObject.rectAreaLightColor,
  6,
  1,
  1
);
rectAreaLight.position.set(-1.5, 0, 1.5);
rectAreaLight.lookAt(zero);
rectAreaFolder.add(rectAreaLight, "intensity", 0, 10, 0.1).name("Intensity");
rectAreaFolder
  .addColor(debugObject, "rectAreaLightColor")
  .name("Color")
  .onChange(() => rectAreaLight.color.set(debugObject.rectAreaLightColor));
rectAreaFolder.close();
scene.add(rectAreaLight);

// Spot Light
const spotLightFolder = gui.addFolder("Spot Light");
debugObject.spotLightColor = 0x78ff00;
const spotLight = new THREE.SpotLight(
  debugObject.spotLightColor,
  4.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
spotLight.position.set(0, 2, 3);
spotLight.target.position.x = -0.75;
spotLightFolder.add(spotLight, "intensity", 0, 10, 0.1).name("Intensity");
spotLightFolder
  .addColor(debugObject, "spotLightColor")
  .name("Color")
  .onChange(() => spotLight.color.set(debugObject.spotLightColor));
spotLightFolder.close();
scene.add(spotLight, spotLight.target);

/**
 * Helpers Toggle
 */
const helperFolder = gui.addFolder("Helpers");
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  0.2
);
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
const hemisphereLightHelper = new THREE.HemisphereLightHelper(
  hemisphereLight,
  0.2
);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);

debugObject.helpers = [
  directionalLightHelper,
  rectAreaLightHelper,
  spotLightHelper,
  hemisphereLightHelper,
  pointLightHelper,
];
debugObject.showHelpers = true;
helperFolder
  .add(debugObject, "showHelpers")
  .name("Show Helpers")
  .onChange((v) => {
    debugObject.helpers.forEach((helper) => {
      helper.visible = v;
    });
  });
helperFolder.close();
scene.add(...debugObject.helpers);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;
const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);
const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  material
);
torus.position.x = 1.5;
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;
scene.add(sphere, cube, torus, plane);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
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
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime();
  sphere.rotation.y = 0.1 * elapsedTime;
  cube.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;
  sphere.rotation.x = 0.15 * elapsedTime;
  cube.rotation.x = 0.15 * elapsedTime;
  torus.rotation.x = 0.15 * elapsedTime;
  controls.update();
  renderer.render(scene, camera);
});
