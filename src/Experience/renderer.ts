import * as THREE from 'three';

const createRenderer = () => {
    const renderer = new THREE.WebGLRenderer({ antialias: true , powerPreference : 'high-performance' });
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.1;
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}

export { createRenderer } ;