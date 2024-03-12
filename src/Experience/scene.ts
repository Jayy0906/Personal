import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const createScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Set 3D scene's background color to white
    // const ambientLight = new THREE.AmbientLight(0xf48037, .25);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    return scene;
}

const createCamera = () => {
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-4, 2, 5);
    // camera.lookAt(0, 3, 0);
    return camera;
}

const createOrbitControls = (camera: THREE.PerspectiveCamera, mycanvas : HTMLCanvasElement) => {
    const controls = new OrbitControls(camera, mycanvas);
    // const controls = new OrbitControls(camera, mycanvas);

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    // controls.screenSpacePanning = false;
    // controls.maxDistance = 50 ; 
    // controls.minDistance = 1;  
    // camera.position.set(-4, 2, 5);
    // camera.lookAt(0, 3, 0);
    return controls;
}

export { createScene, createCamera, createOrbitControls }; 