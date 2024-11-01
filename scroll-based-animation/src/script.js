import * as THREE from "three";
import GUI from "lil-gui";

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onFinishChange((value) => {
  meterial.color.set(value);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);
/**
 * Objects
 */
// texture
const texture = new THREE.TextureLoader().load("/textures/gradients/3.jpg");
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
const meterial = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: texture,
});

//mesh
const objectsDisttance = 4;
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), meterial);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), meterial);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  meterial
);

mesh1.position.y = -objectsDisttance * 0;
mesh2.position.y = -objectsDisttance * 1;
mesh3.position.y = -objectsDisttance * 2;
mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;
scene.add(mesh1, mesh2, mesh3);

const sectionsMeshes = [mesh1, mesh2, mesh3];

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
const group = new THREE.Group();
scene.add(group);
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
// scene.add(camera);
group.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  // alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});
const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let prevTime = 0;

renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  // Update meshes
  sectionsMeshes.forEach((mesh) => {
    mesh.rotation.x = elapsedTime * 0.1;
    mesh.rotation.y = elapsedTime * 0.15;
  });

  // Update camera
  camera.position.y = (-scrollY / sizes.height) * objectsDisttance;
  const paralaxX = cursor.x * 0.5;
  const paralaxY = -cursor.y * 0.5;
  group.position.x += (paralaxX - group.position.x) * 5 * deltaTime;
  group.position.y += (paralaxY - group.position.y) * 5 * deltaTime;

  // Render
  renderer.render(scene, camera);
});
