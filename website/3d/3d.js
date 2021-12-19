import * as THREE from "https://cdn.skypack.dev/three";
import { GLTFLoader } from "./GLTFLoader.js";
import { OrbitControls } from "./OrbitControls.js";

let camera, scene, renderer;
// let geometry, material, mesh;

let mainEl = document.querySelector("main #threejs");
const mainHeight = mainEl.clientHeight;
const mainWidth = mainEl.clientWidth;
init();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, mainEl.clientWidth / mainEl.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor("#fff");
  // renderer.setClearColor("#1b1b1b");
  renderer.setSize(mainEl.clientWidth, mainEl.clientHeight);
  mainEl.appendChild(renderer.domElement);

  window.addEventListener("resize", function () {
    mainEl = document.querySelector("main #threejs");
    renderer.setSize(mainEl.clientWidth, mainEl.clientHeight);
    camera.aspect = mainEl.clientWidth / mainEl.clientHeight;
    camera.updateProjectionMatrix();
  });

  const geometry = new THREE.SphereGeometry(1, 10, 10);
  const material = new THREE.MeshLambertMaterial({ color: 0xff00c1 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const light = new THREE.PointLight(0xffffff, 1, 500);
  light.position.set(10, 0, 25);
  scene.add(light);

  renderer.render(scene, camera);
  /*
  const loader = new GLTFLoader();
  let gltf;
  loader.load(
    // "./poly.glb",
    "http://127.0.0.1:8181/poly.glb",
    function (gltf) {
      scene.add(gltf.scene);
    },
    // called while loading is progressing
    function (xhr) {
      // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // onError callback
    function (error) {
      console.error("Error with GTLFLoader", error);
    }
    );
    
    // light
    const light = new THREE.AmbientLight("#fff", 3); // light color, intensity
    scene.add(light);
    
    // orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    
    controls.listenToKeyEvents(document.body);
    */
}

// function animation(time) {
// mesh.rotation.x = time / 2000;
// mesh.rotation.y = time / 1000;
//
// renderer.render(scene, camera);
// }
