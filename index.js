// Load the 3D model in 3D web viewer --------------------------------

import { HemisphereLight } from "three";
import {
  Color,
  MultiplyBlending,
  PMREMGenerator,
  ACESFilmicToneMapping,
  sRGBEncoding,
  WebGLRenderer,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  PerspectiveCamera,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { IfcViewerAPI } from 'web-ifc-viewer';

let camera, scene, renderer;

init();
render();

function init() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputEncoding = sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  camera = new PerspectiveCamera(
    12,
    window.innerWidth / window.innerHeight,
    0.25,
    1000
  );
  camera.position.set(100, 100, 200);

  const pmremGenerator = new PMREMGenerator(renderer);

  scene = new Scene();
  scene.background = new Color(0xf0f0f0);
  scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;

  /*
  const loader = new GLTFLoader().setPath("models/");
  loader.load("demo-ar.glb", async function (gltf) {
    scene.add(gltf.scene);
    const shadowMesh = createSpotShadowMesh();
    shadowMesh.position.y = -3.0;
    shadowMesh.position.z = -0.25;
    shadowMesh.position.x = 0.25;
    shadowMesh.scale.setScalar(30);
    scene.add(shadowMesh);
    render();
  });
  */

//WIT
const light = new HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

  const ifcLoader = new IFCLoader().setPath("models/");
  ifcLoader.load("RVT21 Villa Le Sextant.ifc", async function (ifc) {
    scene.add(ifc);
  });


//WIV
/*
const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

async function loadIfc(url) {
  // Load the model
  const model = await viewer.IFC.loadIfcUrl(url);

  // Add dropped shadow and post-processing efect
  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;
}

loadIfc('./models/RVT21 Villa Le Sextant.ifc');
*/



  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  controls.minDistance = 0.1;
  controls.maxDistance = 100;
  controls.target.set(0, -0.15, -0.2);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function createSpotShadowMesh() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0.1, "rgba(130,130,130,1)");
  gradient.addColorStop(1, "rgba(255,255,255,1)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const shadowTexture = new CanvasTexture(canvas);

  const geometry = new PlaneGeometry();
  const material = new MeshBasicMaterial({
    map: shadowTexture,
    blending: MultiplyBlending,
    toneMapped: false,
  });

  const mesh = new Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function render() {
  renderer.render(scene, camera);
}
