// import { SpotLightMaterial } from '@pmndrs/vanilla';
// import * as THREE from 'three';

// export const Volumetric = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
//     const spotLight = new THREE.SpotLight(0xffffff);

//     const params = {
//         poition: new THREE.Vector3(6, 6, -1),
//         distance: 10,
//         intensity: 0,
//         width: 1024,
//         height: 1024,
//         near: 0,
//         far: 100,
//         decay: 0,
//         angle: Math.PI / 3,
//         fov: 10,
//         anglePower: 5,
//         radiusTop: .3,
//         radiusBottom: (Math.PI / 3) * 7
//     }

//     spotLight.position.set(params.poition.x, params.poition.y, params.poition.z);
//     spotLight.distance = params.distance;
//     spotLight.castShadow = true;
//     spotLight.intensity = params.intensity;
//     spotLight.shadow.mapSize.width = params.width;
//     spotLight.shadow.mapSize.height = params.height;
//     spotLight.shadow.camera.near = params.near;
//     spotLight.shadow.camera.far = params.far;
//     spotLight.shadow.camera.fov = params.fov;
//     spotLight.decay = params.decay;
//     spotLight.angle = params.angle;

//     scene.add(spotLight);

//     const volumeMaterial = new SpotLightMaterial({
//         spotPosition: spotLight.position,
//         lightColor: spotLight.color,
//         attenuation: spotLight.distance,
//         anglePower: params.anglePower,
//         cameraNear: camera.near,
//         cameraFar: camera.far
//     });

//     console.log(volumeMaterial)

//     const volumeMesh = new THREE.Mesh(getSpotGeo(spotLight.distance, params.radiusTop, params.radiusBottom), volumeMaterial);

//     spotLight.add(volumeMesh);

//     return { volumeMesh, spotLight };
// }


// const getSpotGeo = (distance: any, radiusTop: any, radiusBottom: any) => {
//     const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, distance, 128, 64, true)
//     geometry.translate(0, -distance / 2, 0)
//     geometry.rotateX(-Math.PI / 2)
//     return geometry;
// }

// npm install @pmndrs/vanilla

// npm install @types/pmndrs__vanilla --save-dev