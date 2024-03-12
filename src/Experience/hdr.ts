import * as THREE from 'three' ;

export const HDRICtrl = (renderer : THREE.WebGLRenderer) =>{
    const elem = document.getElementById('intensity-hdri') as HTMLInputElement ;
    elem.addEventListener('input' , (e)=>{
        //@ts-ignore
        renderer.toneMappingExposure = e.target.value ; 
    }) 
}