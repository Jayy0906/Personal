// import { SubsurfaceScatteringShader } from 'three/examples/jsm/shaders/SubsurfaceScatteringShader';
import { SubsurfaceScatteringShader } from 'three/examples/jsm/shaders/SubsurfaceScatteringShader.js';
import { RepeatWrapping, ShaderMaterial, TextureLoader, UniformsUtils, Vector3, DoubleSide } from 'three';

function createSubsurfaceMaterial() {
    const texLoader = new TextureLoader();
    const subTexture = texLoader.load(
      './textures/subTexture.png'
    );
    subTexture.wrapS = subTexture.wrapT = RepeatWrapping;
    subTexture.repeat.set(4, 4);
  
    const shader = SubsurfaceScatteringShader;
    const uniforms = UniformsUtils.clone(shader.uniforms) as {
      [uniform: string]: { value: any };
    };
  
    // Adjust the color to a more neutral tone
    uniforms.diffuse.value = new Vector3(0.9, 0.7, 0.5);
    uniforms.shininess.value = 10;
  
    uniforms.thicknessMap.value = subTexture;
    uniforms.thicknessColor.value = new Vector3(0.5607843137254902, 0.26666666666666666, 0.054901960784313725);
    uniforms.thicknessDistortion.value = 0.1;
    uniforms.thicknessAmbient.value = 0.4;
    uniforms.thicknessAttenuation.value = 0.7;
    uniforms.thicknessPower.value = 10.0;
    uniforms.thicknessScale.value = 1;
  
    const subMaterial = new ShaderMaterial({
      uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      lights: true,
    });
  
    subMaterial.side = DoubleSide; // Render on both sides of the geometry
  
    return subMaterial;
  }

function replaceMaterial(model: THREE.Object3D, materialName: string, newMaterial: THREE.Material) {
    model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;

            // Check if the mesh name matches the specified materialName
            if (mesh.name === materialName) {
                // console.log(`Replacing material for ${materialName}`);
                mesh.material = newMaterial;
            }
        }
    });
}

export { createSubsurfaceMaterial, replaceMaterial };