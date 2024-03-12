import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

//@ts-ignore
import GLTFMeshGpuInstancingExtension from 'three-gltf-extensions/loaders/EXT_mesh_gpu_instancing/EXT_mesh_gpu_instancing.js';
//@ts-ignore
import GLTFMaterialsVariantsExtension from 'three-gltf-extensions/loaders/KHR_materials_variants/KHR_materials_variants.js';

const createLoaders = (renderer: THREE.WebGLRenderer) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    const ktx2Loader = new KTX2Loader();

    ktx2Loader.setTranscoderPath('/basis/');
    ktx2Loader.detectSupport(renderer);

    dracoLoader.setDecoderPath('/draco/');

    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(ktx2Loader);

    loader.register((parser) => new GLTFMaterialsVariantsExtension(parser));
    loader.register((parser) => new GLTFMeshGpuInstancingExtension(parser));

    return { loader, ktx2Loader };
}

export { createLoaders }; 