import * as THREE from 'three';
import { EffectComposer, EffectPass, RenderPass, SMAAEffect, FXAAEffect, BlendFunction, SMAAPreset, EdgeDetectionMode, PredicationMode, NormalPass, SSAOEffect } from "postprocessing";
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';

export const composer = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    // Create the EffectComposer
    let composer = new EffectComposer(renderer);
    
    // Add RenderPass
    composer.addPass(new RenderPass(scene, camera));

    // FXAA
    const fxaaPass = new FXAAEffect({ blendFunction: BlendFunction.NORMAL });
    let fxaaEffectPass = new EffectPass(camera, fxaaPass);

    // SMAA
    const smaaPass = new SMAAEffect({
        preset: SMAAPreset.MEDIUM,
        edgeDetectionMode: EdgeDetectionMode.COLOR,
        predicationMode: PredicationMode.DEPTH,
    });
    const smaaEffect = new EffectPass(camera, smaaPass);

    // SSAO
    const normalPass = new NormalPass(scene, camera);
    let ssaoPass = new SSAOEffect(camera, normalPass.texture, {
        worldDistanceThreshold: 20,
        worldDistanceFalloff: 5,
        worldProximityThreshold: 0.4,
        worldProximityFalloff: 0.1,
        luminanceInfluence: 0.7,
        samples: 16,
        radius: 0.04,
        intensity: 1,
        resolutionScale: 0.5
    });
    const ssaoEffect = new EffectPass(camera, ssaoPass);

    // TAA
    const taaRenderPass = new TAARenderPass(scene, camera);
    taaRenderPass.sampleLevel = 1;
    let taaEffect = new EffectPass(camera);

    // Toggle listeners
    const elemFxaa = document.getElementById('fxaaToggle') as HTMLInputElement;
    elemFxaa?.addEventListener('input', () => {
        if (elemFxaa.checked) {
            composer.addPass(fxaaEffectPass);
        } else {
            composer.removePass(fxaaEffectPass);
        }
    });

    const elemSmaa = document.getElementById('smaaToggle') as HTMLInputElement;
    elemSmaa.addEventListener('input', () => {
        if (elemSmaa.checked) {
            composer.addPass(smaaEffect);
        } else {
            composer.removePass(smaaEffect);
        }
    });

    const elemSsao = document.getElementById('ssaoToggle') as HTMLInputElement;
    elemSsao.addEventListener('input', () => {
        if (elemSsao.checked) {
            composer.addPass(ssaoEffect);
        } else {
            composer.removePass(ssaoEffect);
        }
    });

    const elemTaa = document.getElementById('taaToggle') as HTMLInputElement;
    elemTaa.addEventListener('input', () => {
        if (elemTaa.checked) {
            composer.addPass(taaEffect);
        } else {
            composer.removePass(taaEffect);
        }
    });

    return composer;
};




// import * as THREE from 'three';
// import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js' ; 
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
// import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
// import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';

// export const threeComposer = ( renderer : THREE.WebGLRenderer , scene : THREE.Scene , camera : THREE.PerspectiveCamera ) =>{
//     let composer = new EffectComposer( renderer );
//     composer.addPass( new RenderPass( scene, camera ) );

//     const pixelRatio = renderer.getPixelRatio() ; 
//     let smaaPass = new SMAAPass( window.innerWidth * pixelRatio , window.innerHeight * pixelRatio );

//     let fxaaPass = new ShaderPass( FXAAShader );
//     fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
//     fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
//     composer.addPass(fxaaPass) ;

//     let taaRenderPass = new TAARenderPass( scene, camera );
//     taaRenderPass.unbiased = true;
//     taaRenderPass.sampleLevel = 3 ; 

//     const elem = document.getElementById('SMAA_C') as HTMLInputElement ; 
//     elem.addEventListener('input', ()=>{
//         if( elem.checked ){
//             composer.addPass( smaaPass );
//         }
//         else{
//             composer.removePass(smaaPass);
//         }
//     })

//     const elem2 = document.getElementById('FXAA_C') as HTMLInputElement ; 
//     elem2.addEventListener('click' , ()=>{
//         if( elem2.checked ){
//             composer.addPass(fxaaPass) ; 
//         }
//         else{
//             composer.removePass(fxaaPass) ; 
//         }
//     })

//     const elem3 = document.getElementById('TAA_C') as HTMLInputElement ; 
//     elem3.addEventListener('input' , ()=>{
//         if( elem3.checked ){
//             composer.addPass( taaRenderPass );
//         }
//         else{
//             composer.removePass( taaRenderPass );
//         }
//     })

//     const outputPass = new OutputPass();
//     composer.addPass( outputPass );

//     return composer ;
// }