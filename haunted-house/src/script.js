import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";

// Define colors
const colors = {
  roofColor: "#b35f45",
  bushColor: "#89c854",
  fogColor: "#262837",
  graveColor: "#b2b6b1",
  envLightColor: "#b9d5ff",
  doorLightColor: "#ff7d46",
};

/**
 * Basic Setup
 */
const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(colors.fogColor, 1, 15);

/**
 * Load Textures
 */
const textureLoader = new THREE.TextureLoader();
const textures = {
  door: {
    color: textureLoader.load("/textures/door/color.jpg"),
    alpha: textureLoader.load("/textures/door/alpha.jpg"),
    ambientOcclusion: textureLoader.load("/textures/door/ambientOcclusion.jpg"),
    height: textureLoader.load("/textures/door/height.jpg"),
    metalness: textureLoader.load("/textures/door/metalness.jpg"),
    normal: textureLoader.load("/textures/door/normal.jpg"),
    roughness: textureLoader.load("/textures/door/roughness.jpg"),
  },
  bricks: {
    color: textureLoader.load("/textures/bricks/color.jpg"),
    ambientOcclusion: textureLoader.load(
      "/textures/bricks/ambientOcclusion.jpg"
    ),
    normal: textureLoader.load("/textures/bricks/normal.jpg"),
    roughness: textureLoader.load("/textures/bricks/roughness.jpg"),
  },
  grass: {
    color: textureLoader.load("/textures/grass/color.jpg"),
    ambientOcclusion: textureLoader.load(
      "/textures/grass/ambientOcclusion.jpg"
    ),
    normal: textureLoader.load("/textures/grass/normal.jpg"),
    roughness: textureLoader.load("/textures/grass/roughness.jpg"),
  },
};

// Repeat and wrap grass texture
Object.keys(textures.grass).forEach((key) => {
  textures.grass[key].repeat.set(8, 8);
  textures.grass[key].wrapS = THREE.RepeatWrapping;
  textures.grass[key].wrapT = THREE.RepeatWrapping;
});

/**
 * Create House
 */
const house = new THREE.Group();
scene.add(house);

// House materials
const wallMaterial = new THREE.MeshStandardMaterial({
  map: textures.bricks.color,
  aoMap: textures.bricks.ambientOcclusion,
  normalMap: textures.bricks.normal,
  roughnessMap: textures.bricks.roughness,
});
const roofMaterial = new THREE.MeshStandardMaterial({
  color: colors.roofColor,
});
const doorMaterial = new THREE.MeshStandardMaterial({
  map: textures.door.color,
  alphaMap: textures.door.alpha,
  transparent: true,
  aoMap: textures.door.ambientOcclusion,
  displacementMap: textures.door.height,
  displacementScale: 0.1,
  normalMap: textures.door.normal,
  metalnessMap: textures.door.metalness,
  roughnessMap: textures.door.roughness,
});
const bushMaterial = new THREE.MeshStandardMaterial({
  color: colors.bushColor,
});
const floorMaterial = new THREE.MeshStandardMaterial({
  map: textures.grass.color,
  aoMap: textures.grass.ambientOcclusion,
  normalMap: textures.grass.normal,
  roughnessMap: textures.grass.roughness,
});

// Walls
const houseHeight = 2.5;
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, houseHeight, 4),
  wallMaterial
);
walls.position.y = houseHeight / 2;
walls.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
house.add(walls);

// Roof
const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1, 4), roofMaterial);
roof.position.y = houseHeight + 0.5;
roof.rotation.y = Math.PI / 4;
house.add(roof);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  doorMaterial
);
door.position.set(0, 1, 2.01);
door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushes = [
  { scale: 0.5, position: [0.8, 0.2, 2.2] },
  { scale: 0.3, position: [1.4, 0.1, 2.1] },
  { scale: 0.4, position: [-0.8, 0.1, 2.2] },
  { scale: 0.2, position: [-1, 0.05, 2.6] },
];

bushes.forEach(({ scale, position }, index) => {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.scale.set(scale, scale, scale);
  bush.position.set(...position);
  bushes[index].mesh = bush;
  house.add(bush);
});

/**
 * Add Graves
 */
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
  color: colors.graveColor,
});

for (let i = 0; i < 30; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3.5 + Math.random() * 6;
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.position.set(Math.sin(angle) * radius, 0.3, Math.cos(angle) * radius);
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  graves.add(grave);
}

/**
 * Floor
 */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMaterial);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(colors.envLightColor, 0.12);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(colors.envLightColor, 0.12);
moonLight.position.set(4, 5, -2);
scene.add(moonLight);

const doorLight = new THREE.PointLight(colors.doorLightColor, 3, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

/**
 * Ghosts Array
 */
const ghosts = [
  { color: "#ff00ff", intensity: 2, distance: 4, speed: 0.5, flickerSpeed: 3 },
  { color: "#00ffff", intensity: 2, distance: 5, speed: 0.32, flickerSpeed: 4 },
  { color: "#ffff00", intensity: 2, distance: 7, speed: 0.18, flickerSpeed: 5 },
];

// Create ghost lights and add them to the scene
ghosts.forEach((ghost, index) => {
  const light = new THREE.PointLight(ghost.color, ghost.intensity, 3);
  light.castShadow = true;
  scene.add(light);
  ghost.light = light;
  ghost.flickerOffset = Math.random() * Math.PI;

  // GUI Controls
  const folder = gui.addFolder(`Ghost ${index + 1}`);
  folder
    .addColor(ghost, "color")
    .onChange((value) => ghost.light.color.set(value));
  folder
    .add(ghost, "intensity", 0, 5, 0.1)
    .onChange((value) => (ghost.light.intensity = value));
  folder.add(ghost, "speed", 0, 1, 0.01);
  folder.add(ghost, "flickerSpeed", 0, 10, 0.1);
});

/**
 * Camera & Controls
 */
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 2, 5);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(colors.fogColor);

/**
 * Shadows
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

moonLight.castShadow = true;
doorLight.castShadow = true;
walls.castShadow = true;
bushes.forEach((bush) => (bush.mesh.castShadow = true));
ghosts.forEach((ghost) => (ghost.light.castShadow = true));
graves.children.forEach((grave) => (grave.castShadow = true));

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghosts.forEach((ghost) => {
  ghost.light.shadow.mapSize.width = 256;
  ghost.light.shadow.mapSize.height = 256;
  ghost.light.shadow.camera.far = 7;
});

// Resizing
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime();

  ghosts.forEach((ghost) => {
    const angle = elapsedTime * ghost.speed;
    ghost.light.position.set(
      Math.cos(angle) * ghost.distance,
      Math.sin(elapsedTime * ghost.flickerSpeed + ghost.flickerOffset) +
        Math.sin(elapsedTime * ghost.speed * 2),
      Math.sin(angle) * ghost.distance
    );
    ghost.light.intensity =
      ghost.intensity +
      Math.sin(elapsedTime * ghost.flickerSpeed + ghost.flickerOffset) * 0.5;
  });

  controls.update();
  renderer.render(scene, camera);
});
