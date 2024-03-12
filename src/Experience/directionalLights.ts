import * as THREE from 'three';


function addDirectionalLight(scene: THREE.Scene) {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    // directionalLight.name = 'direct_light' ; 
    directionalLight.position.set(10, 5, 10); // Adjust the light position
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.bias = -0.005;
    directionalLight.shadow.radius = 4;

    scene.add(directionalLight);

    return directionalLight;
}

export { addDirectionalLight }; 