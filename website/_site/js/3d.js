import * as THREE from "https://cdn.skypack.dev/three";
import  { GLTFLoader }  from "./GLTFLoader.js";

let camera, scene, renderer;
let geometry, material, mesh;

const mainEl = document.querySelector("main");
const mainHeight = mainEl.clientHeight;
const mainWidth = mainEl.clientWidth;

init();

function init() {
  camera = new THREE.PerspectiveCamera(70, mainWidth / mainHeight, 0.01, 10);
  camera.position.z = 1;

  scene = new THREE.Scene();

  geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  material = new THREE.MeshNormalMaterial();

  mesh = new THREE.Mesh(geometry, material);

  const loader = new GLTFLoader();
    loader.load( './poly.glb', function ( gltf ) {

  	scene.add( gltf.scene );

  }, undefined, function ( error ) {

  	console.error( error );

  } );
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(mainWidth, mainHeight);
  renderer.setAnimationLoop(animation);
  mainEl.appendChild(renderer.domElement);
}

function animation(time) {
  mesh.rotation.x = time / 2000;
  mesh.rotation.y = time / 1000;

  renderer.render(scene, camera);
}
