import * as THREE from "three";
import gsap from "gsap";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

gsap.to(mesh.position, { x: 2, duration: 1, delay: 1 });
gsap.to(mesh.position, { x: 0, duration: 1, delay: 2 });

gsap.to(mesh.rotation, {
  y: Math.PI * 2,
  duration: 5,
  delay: 1,
  repeat: Infinity,
});

//Clock
const clock = new THREE.Clock();
// let time = Date.now();

// Animation
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  //   const currentTime = Date.now();
  //   const deltaTime = currentTime - time;
  //   time = currentTime;
  //   mesh.rotation.x = 0.01 * deltaTime;

  //   mesh.rotation.x = elapsedTime * 0.25;
  //   mesh.position.y = Math.sin(elapsedTime);
  //   mesh.position.x = Math.cos(elapsedTime);

  renderer.render(scene, camera);

  // console.log("animate");
  requestAnimationFrame(animate);
};

// setInterval(() => {
//     animate();
// }, 1000);
animate();
