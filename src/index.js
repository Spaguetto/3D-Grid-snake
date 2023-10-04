import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();
const objects = [];

const highlightMesh = createHighlightMesh();

camera.position.set(10, 15, -22);
initRenderer();
addGridAndPlane();
addEventListeners();

function initRenderer() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.update();
}

function createHighlightMesh() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    })
  );
  mesh.rotateX(-Math.PI / 2);
  scene.add(mesh);
  return mesh;
}

function addGridAndPlane() {
  const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      visible: false
    })
  );
  planeMesh.rotateX(-Math.PI / 2);
  scene.add(planeMesh);

  const grid = new THREE.GridHelper(15, 15);
  scene.add(grid);
}

function addEventListeners() {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("resize", onWindowResize);
}

function onMouseMove(e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mousePosition, camera);

  const intersects = raycaster.intersectObject(scene.children[0]);
  const highlightPos =
    intersects.length > 0 ? getHighlightPosition(intersects[0]) : null;

  if (highlightPos) {
    highlightMesh.position.copy(highlightPos);
    updateHighlightColor(highlightPos);
  }
}

function getHighlightPosition(intersect) {
  return new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
}

function updateHighlightColor(position) {
  const objectExist = objects.some((object) => {
    return object.position.x === position.x && object.position.z === position.z;
  });

  highlightMesh.material.color.setHex(objectExist ? 0xff0000 : 0xffffff);
}

function onMouseDown() {
  const position = highlightMesh.position.clone();

  if (!objects.some((object) => object.position.equals(position))) {
    const newMesh = createNewMesh(position);
    scene.add(newMesh);
    objects.push(newMesh);
    handleMeshClick();
  } else {
    console.log("Item is here");
  }
}

function createNewMesh(position) {
  const newMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true
    })
  );
  newMesh.rotateX(-Math.PI / 2);
  newMesh.position.copy(position);
  return newMesh;
}

function handleMeshClick() {
  const clicks = objects.filter(
    (object) => object.material.color.getHex() === 0xaaff00
  ).length;

  if (clicks === 1) {
    objects[objects.length - 1].material.color.setHex(0xff0000);
  }
}

function animate(time) {
  highlightMesh.material.opacity = 1 + Math.sin(time / 120);
  objects.forEach((object) => {
    object.rotation.x = time / 1000;
    object.rotation.z = time / 1000;
    object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
  });
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
