import * as THREE from 'three';
import { EffectComposer, EffectPass, RenderPass, SMAAEffect, FXAAEffect, BlendFunction, SMAAPreset, EdgeDetectionMode, PredicationMode, NormalPass, SSAOEffect } from "postprocessing";
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';

export const composer = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    // Create the EffectComposer
    const composer = new EffectComposer(renderer);
    
    // Add RenderPass
    composer.addPass(new RenderPass(scene, camera));

    // FXAA
    const fxaaPass = new FXAAEffect({ blendFunction: BlendFunction.NORMAL });
    const fxaaEffectPass = new EffectPass(camera, fxaaPass);

    // SMAA
    const smaaPass = new SMAAEffect({
        preset: SMAAPreset.MEDIUM,
        edgeDetectionMode: EdgeDetectionMode.COLOR,
        predicationMode: PredicationMode.DEPTH,
    });
    const smaaEffect = new EffectPass(camera, smaaPass);

    // SSAO
    const normalPass = new NormalPass(scene, camera);
    const ssaoPass = new SSAOEffect(camera, normalPass.texture, {
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
    const taaEffect = new EffectPass(camera);

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