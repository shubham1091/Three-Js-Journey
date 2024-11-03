import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import CANNON from "cannon";
import GUI from "lil-gui";

/**
 * Debug
 */
const gui = new GUI();
const debugObjecet = {
  createSphere: () => {
    createSphere(Math.random() * 0.5, {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    });
  },
  createBox: () => {
    creteBox(Math.random(), Math.random(), Math.random(), {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    });
  },
  reset: () => {
    objectToUpdate.forEach(({ mesh, body }) => {
      body.removeEventListener("collide", playHitSound);
      world.removeBody(body);
      scene.remove(mesh);
    });
    // objectToUpdate.splice(0, objectToUpdate.length)
    objectToUpdate.length = 0;
  },
};

gui.add(debugObjecet, "createSphere");
gui.add(debugObjecet, "createBox");
gui.add(debugObjecet, "reset");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Sounds
 */
const hitSound = new Audio("/sounds/hit.mp3");

const playHitSound = (collision) => {
  const strength = collision.contact.getImpactVelocityAlongNormal();
  if (strength < 1.5) {
    return;
  }

  hitSound.volume = Math.random();
  hitSound.currentTime = 0;
  hitSound.play();
};
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const envMapSet = 0;
const environmentMapTexture = cubeTextureLoader.load([
  `/textures/environmentMaps/${envMapSet}/px.png`,
  `/textures/environmentMaps/${envMapSet}/nx.png`,
  `/textures/environmentMaps/${envMapSet}/py.png`,
  `/textures/environmentMaps/${envMapSet}/ny.png`,
  `/textures/environmentMaps/${envMapSet}/pz.png`,
  `/textures/environmentMaps/${envMapSet}/nz.png`,
]);

/**
 * Physics
 */
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

// material
const defaultMaterial = new CANNON.Material("default");
const concreteMaterial = new CANNON.Material("concrete");
const plasticMaterial = new CANNON.Material("plastic");

const concretePlasticContactMaterial = new CANNON.ContactMaterial(
  concreteMaterial,
  plasticMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);

world.addContactMaterial(concretePlasticContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI * 0.5);
// floorBody.material = concreteMaterial;
world.addBody(floorBody);

/**
 * Floor
 */
const floorMaterial = new THREE.MeshStandardMaterial({
  color: "#777777",
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMaterial);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
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

// Debounced resize event
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
camera.position.set(-3, 3, 3);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Utils
 */
const objectToUpdate = [];

const SphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const SphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});
const createSphere = (radius, position) => {
  // mesh
  const mesh = new THREE.Mesh(SphereGeometry, SphereMaterial);
  mesh.castShadow = true;
  mesh.position.copy(position);
  mesh.scale.set(radius, radius, radius);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position,
    shape,
    material: defaultMaterial,
  });
  body.addEventListener("collide", playHitSound);
  world.addBody(body);
  objectToUpdate.push({ mesh, body });
};

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});
const creteBox = (width, height, depth, position) => {
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  mesh.castShadow = true;
  mesh.position.copy(position);
  mesh.scale.set(width, height, depth);
  scene.add(mesh);

  const shape = new CANNON.Box(
    new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
  );
  const body = new CANNON.Body({
    mass: 1,
    position,
    shape,
    material: defaultMaterial,
  });
  body.addEventListener("collide", playHitSound);
  world.addBody(body);
  objectToUpdate.push({ mesh, body });
};

/**
 * Animate
 */
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime();

  // update physics
  world.step(1 / 60, clock.getDelta(), 3);
  objectToUpdate.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
});
