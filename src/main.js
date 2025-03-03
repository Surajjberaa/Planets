import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/Addons.js';

// Create scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
const canvas = document.querySelector('#canvas')
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});

// Set pixel ratio and size
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 10;

// Add orbit controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true; // Add smooth damping effect
// controls.dampingFactor = 0.05;


const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

const spheres = new THREE.Group()
const radius = 1.3
const segments = 64
const orbitalRadius = 4.5
const colors = ['#FF4136', '#2ECC40', '#0074D9', '#B10DC9'];
const stars = 'https://res.cloudinary.com/dggyfyynb/image/upload/v1740931606/stars_ndonzo.jpg'
const planetTextures = ['https://res.cloudinary.com/dggyfyynb/image/upload/v1741031763/uranus_kr1wxw.jpg', 'https://res.cloudinary.com/dggyfyynb/image/upload/v1741031749/earth_fzvkon.jpg', 'https://res.cloudinary.com/dggyfyynb/image/upload/v1741031764/venus_s2wp4w.jpg', 'https://res.cloudinary.com/dggyfyynb/image/upload/v1741031762/mars_lr5qaf.jpg']

// Create a large sphere for the background
const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load(stars);
starTexture.colorSpace = THREE.SRGBColorSpace;
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshPhysicalMaterial({
  map: starTexture,
  opacity: 0.1,
  side: THREE.BackSide // Render the inside of the sphere
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);

const sphereMesh = []

for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(planetTextures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);

  sphereMesh.push(sphere)

  const angle = (i / 4) * (Math.PI * 2)

  sphere.position.x = orbitalRadius * Math.cos(angle)
  sphere.position.z = orbitalRadius * Math.sin(angle)

  spheres.add(sphere);
}

spheres.rotation.x = 0.1
spheres.position.y = -0.8
scene.add(spheres)

// // Rotate spheres group continuously
// setInterval(() => {

//   gsap.to(spheres.rotation, {
//     y: `+=${Math.PI / 2}`,
//     duration: 2,
//     ease: 'expo.easeInOut'
//   })

// }, 4000);


let lastScrollTime = 0;
const scrollThrottleDelay = 2000; // 2 seconds
let scrollCount = 0;

window.addEventListener('wheel', (event) => {
  const currentTime = Date.now();

  let scrollPosition = undefined
  
  if (currentTime - lastScrollTime >= scrollThrottleDelay) {
    event.deltaY < 0 ? scrollPosition = 'up' : scrollPosition = 'down';
    lastScrollTime = currentTime;

    if (scrollPosition === 'up' && scrollCount === 0) {
      scrollCount = 0;
    }else{
      scrollCount = (scrollCount + 1) % 4;
    }


    const header = document.querySelectorAll('.header');
    if (event.deltaY > 0){
    gsap.to(header, {
      duration: 1,
      y: `-=${100}%`,
      ease: 'power2.inOut',
    });

    gsap.to(spheres.rotation, {
      y: `-=${Math.PI / 2}`,
      duration: 2,
      ease: 'expo.easeInOut'
    });
  }

    // if (event.deltaY < 0){
    //   gsap.to(header, {
    //     duration: 1,
    //     y: `+=${100}%`,
    //     ease: 'power2.inOut',
    //   });

    //   gsap.to(spheres.rotation, {
    //     y: `+=${Math.PI / 2}`,
    //     duration: 2,
    //     ease: 'expo.easeInOut'
    //   });

    // }

    if (scrollCount === 0){
      gsap.to(header, {
        duration: 1,
        y: `0`,
        ease: 'power2.inOut',
      });
    }

  }
});


let clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update controls in animation loop
  // controls.update();
  for (let i = 0; i < sphereMesh.length; i++) {
    const sphere = sphereMesh[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.025;
  }

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
