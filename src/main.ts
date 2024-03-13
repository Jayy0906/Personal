import * as THREE from 'three';
import { createRenderer } from './Experience/renderer';
import { createScene, createCamera, createOrbitControls } from './Experience/scene';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { createLoaders } from './Experience/loaders';
import { composer } from './Experience/composer';
import { addDirectionalLight } from './Experience/directionalLights';
import { modelPaths } from './Experience/static';
import { createSubsurfaceMaterial, replaceMaterial } from './Experience/subsurfacematerial';
import { HDRICtrl } from './Experience/hdr';

// import { Volumetric } from './Experience/volumetric';

const progressContainer = document.querySelector('.spinner-container') as HTMLElement;
let specificObject: THREE.Object3D | undefined;

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
const _composer = composer(renderer, scene, camera);
const mycanvas = renderer.domElement;
const controls = createOrbitControls(camera, mycanvas);
const loders = createLoaders(renderer);
const loader = loders.loader;

const canvasContainer: HTMLElement | null = document.getElementById("canvas-container");
if (canvasContainer !== null) {
  canvasContainer.appendChild(renderer.domElement);
}

const dayNightToggle = document.getElementById('dayNightToggle');
let isDayMode = false; // Initial mode is day

function setupHDRI() {
  const rgbeloader = new RGBELoader();
  rgbeloader.load('https://d2629xvaofl3d3.cloudfront.net/neutral.hdr', (hdri) => {
    const myhdr = hdri;
    myhdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = myhdr;
    scene.background = new THREE.Color("#000");
  });
}

setupHDRI();

// Define an array of texture paths
const texturePaths: string[] = [
  'https://d2629xvaofl3d3.cloudfront.net/plane_divided_DefaultMaterial_BaseColor.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/plane_divided_DefaultMaterial_Normal.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/plane_divided_DefaultMaterial_Roughness.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/GWC_Leather_Suede_Blue_Medium_baseColor.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/GWC_Leather_Suede_Blue_Medium_normal.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/GWC_Leather_Suede_Blue_Medium_roughness.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/Orange_base.jpg',
  'https://d2629xvaofl3d3.cloudfront.net/Orange_normal.jpg',
  'https://d2629xvaofl3d3.cloudfront.net/Orange_rough.jpg',
  'https://d2629xvaofl3d3.cloudfront.net/Cloth_BaseColor.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/Cloth_Normal.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/Cloth_Metallic-Cloth_Roughness.png',
  'https://d2629xvaofl3d3.cloudfront.net/fabric_135_albedo-2K.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/fabric_135_normal-2K.jpeg',
  'https://d2629xvaofl3d3.cloudfront.net/fabric_135_roughness-2K.png',
];

// Function to preload textures
async function preloadTextures() {
  const textureLoader = new THREE.TextureLoader();
  const texturePromises: Promise<THREE.Texture>[] = [];

  // Load each texture asynchronously and push the promise to the array
  texturePaths.forEach((path) => {
    const texturePromise = new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(path,
        // onLoad callback
        (texture) => resolve(texture),
        // onProgress callback (not used)
        undefined,
        // onError callback
        (error) => reject(`Error loading texture from ${path}: ${error}`)
      );
    });
    texturePromises.push(texturePromise);
  });

  // Wait for all texture loading promises to resolve
  await Promise.all(texturePromises);
}

// Call the preloadTextures function to initiate texture loading
preloadTextures()
  .then(() => {
    console.log('Textures preloaded successfully.');
    // You can proceed with other operations after textures are loaded
  })
  .catch((error) => {
    console.error('Error preloading textures:', error);
  });

// Define a map to cache materials
const materialCache = new Map();

async function createMaterialFromJSON(jsonData: any): Promise<THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial | THREE.MeshPhongMaterial> {
  progressContainer.style.display = "flex";

  let material: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial | THREE.MeshPhongMaterial;

  // Check if material is already cached
  const cachedMaterial = materialCache.get(jsonData.name);
  if (cachedMaterial) {
    progressContainer.style.display = "none";
    return cachedMaterial.clone();
  }

  if (jsonData.diffuseMap && jsonData.glossMap && jsonData.normalMap) {
    const diffuseMap = await new THREE.TextureLoader().loadAsync(jsonData.diffuseMap);
    const glossMap = await new THREE.TextureLoader().loadAsync(jsonData.glossMap);
    const normalMap = await new THREE.TextureLoader().loadAsync(jsonData.normalMap);

    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;
    glossMap.wrapS = THREE.RepeatWrapping;
    glossMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;

    diffuseMap.repeat.set(jsonData.diffuseMapTiling[0], jsonData.diffuseMapTiling[1]);
    glossMap.repeat.set(jsonData.glossMapTiling[0], jsonData.glossMapTiling[1]);
    normalMap.repeat.set(jsonData.normalMapTiling[0], jsonData.normalMapTiling[1]);

    material = new THREE.MeshPhysicalMaterial({
      metalness: jsonData.metalness,
      roughness: 1 - jsonData.sheenGloss,
      opacity: jsonData.opacity,
      transparent: true,
      map: diffuseMap,
      roughnessMap: glossMap,
      normalMap: normalMap,
      side: jsonData.twoSidedLighting ? THREE.DoubleSide : THREE.FrontSide,
      alphaTest: jsonData.alphaTest,
      depthWrite: jsonData.depthWrite,
      depthTest: jsonData.depthTest,
      color: new THREE.Color(...jsonData.diffuse),
      emissive: new THREE.Color(...jsonData.emissive),
      emissiveIntensity: jsonData.emissiveIntensity,
      aoMap: null,
      aoMapIntensity: 1,
    });

    (material as THREE.MeshPhysicalMaterial).clearcoat = jsonData.clearcoat || 0;
    (material as THREE.MeshPhysicalMaterial).clearcoatRoughness = jsonData.clearcoatRoughness || 0;
    (material as THREE.MeshPhysicalMaterial).reflectivity = jsonData.reflectivity || 0.5;
  } else {
    if (jsonData.name === 'Frosted_Glass') {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(...jsonData.diffuse),
        metalness: 0,
        roughness: 0.1,
        opacity: jsonData.opacity,
        transparent: true,
        side: jsonData.twoSidedLighting ? THREE.DoubleSide : THREE.FrontSide,
        alphaTest: jsonData.alphaTest,
        depthWrite: jsonData.depthWrite,
        depthTest: jsonData.depthTest,
      });
    } else if (jsonData.name === 'Chrome' || 'Brass') {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(...jsonData.diffuse),
        metalness: 1,
        roughness: 0.2,
        opacity: jsonData.opacity,
        transparent: true,
        side: jsonData.twoSidedLighting ? THREE.DoubleSide : THREE.FrontSide,
        alphaTest: jsonData.alphaTest,
        depthWrite: jsonData.depthWrite,
        depthTest: jsonData.depthTest,
      });
    } else {
      material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(...jsonData.diffuse),
        specular: new THREE.Color(...jsonData.specular),
        shininess: jsonData.shininess,
        side: jsonData.twoSidedLighting ? THREE.DoubleSide : THREE.FrontSide,
        alphaTest: jsonData.alphaTest,
        transparent: jsonData.opacity < 1,
        opacity: jsonData.opacity,
        depthWrite: jsonData.depthWrite,
        depthTest: jsonData.depthTest,
      });
    }
  }

  // Cache the material
  materialCache.set(jsonData.name, material);

  progressContainer.style.display = "none";

  return material;
}

//Changing Material variants
const loadedModelsMap: any = {};
let loadedSofa: any = {},
  // loadedFloor: any = {},
  loadedglass: any = {},
  loadedwall: any = {},
  loadedmetal: any = {};
// loadedfloorlamp: any = {};
const originalMaterials = new Map(); // Map to store original materials by node name
let jsonFiles: any = {}; // Variable to store JSON data

// Function to load models one by one
function loadModels(index: number) {
  // console.log('started loading')
  if (index >= modelPaths.length) {
    // All models loaded
    // console.log('All models loaded successfully.');

    HDRICtrl(renderer);
    progressContainer.style.display = 'none';

    // After loading is complete, set the desired pixel ratio
    const finalPixelRatio = window.devicePixelRatio;
    // const finalPixelRatio = window.devicePixelRatio * scaleFactor;
    renderer.setPixelRatio(finalPixelRatio);
    // addDirectionalLight();

    // let volumeMesh : any ;
    // let spotLight : THREE.SpotLight ;

    // const vol = Volumetric(scene , camera , renderer ) ; 
    // volumeMesh = vol.volumeMesh ; 
    // spotLight = vol.spotLight ; 
    return;
  }

  // While loading, set a different pixel ratio
  renderer.setPixelRatio(1);

  const modelPath = modelPaths[index];
  // console.log(modelPath)
  loader.load(modelPath,
    function (gltf) {
      console.log(`Loaded model from ${modelPath}`, gltf);
      // console.log(modelPath)
      // console.log(gltf, index)
      const loadedModel = gltf.scene;

      const modelName = modelPath.split('/')[3].split('.')[0]
      // const modelName = modelPath.split('/')[1].split('.')[0]
      // console.log(modelPath)
      loadedModelsMap[modelName] = gltf;

      // if (modelName === 'Carpet') {
      //   specificObject = gltf.scene; // Store the specific object
      // }

      console.log(modelName);

      gltf.scene.traverse(function (child) {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.receiveShadow = true;
          m.castShadow = true;
        }

        if ((child as THREE.Light).isLight) {
          let l = child as THREE.PointLight;
          l.castShadow = true;
          // l.intensity = 10; // Adjust the intensity value as needed
          l.distance = 5;
          l.decay = 4;
          l.power = 400;
          // l.position.z = -1;
          l.shadow.bias = -0.005;
          l.shadow.mapSize.width = 1024;
          l.shadow.mapSize.height = 1024;
          l.shadow.radius = 2.5;
        }
      });

      if (
        modelPaths[index] ===
        "https://d2629xvaofl3d3.cloudfront.net/Sofa.glb"
      ) {
        loadedSofa = loadedModel;
        storeOriginalMaterials(loadedSofa);
      } else if (
        modelPaths[index] ===
        "https://d2629xvaofl3d3.cloudfront.net/Coffee_Table.glb"
      ) {
        loadedmetal = loadedModel;
        storeOriginalMaterials(loadedmetal);
      } else if (
        modelPaths[index] ===
        "https://d2629xvaofl3d3.cloudfront.net/Window.glb"
      ) {
        loadedglass = loadedModel;
        storeOriginalMaterials(loadedglass);
      }

      gltf.scene.position.set(-2, 0.1, 1);
      // gltf.scene.scale.set(1.1, 1, 1.1);
      scene.add(gltf.scene);

      // Assign the loaded sofa model to the loadedSofa variable
      // loadedSofa = gltf.scene; // Assuming the sofa model is directly the scene

      // Example: Replace material of 'FloorLamp_Cover' with subsurface scattering material
      if (modelName === 'Floor_Lamp') {
        const FloorLamp_Cover = 'FloorLamp_Cover';
        const newMaterial = createSubsurfaceMaterial(); // Or any other material creation logic
        replaceMaterial(gltf.scene, FloorLamp_Cover, newMaterial);
      }

      // console.log(`${modelPath}: Loaded successfully`);

      // Load the next model recursively
      loadModels(index + 1);
    },
    (xhr) => {
      console.log(`${modelPath}: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      // console.log(`${modelPath}: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      // progressBar.style.width = `${progress}%`;
      // console.log(`${modelPath}: ${progress}% loaded`);
    },
    (error) => {
      console.log(`${modelPath}: ${error}`);
      loadModels(index + 1);
    }
  );

  // Show progress bar container
  // progressContainer.style.display = 'block';
}

// Example: Replace material of 'FloorLamp_Cover' with subsurface scattering material
const subsurfaceScatteringMaterial = createSubsurfaceMaterial();

// Ensure that specificObject is defined before replacing its material
if (specificObject) {
  replaceMaterial(specificObject, 'FloorLamp_Cover', subsurfaceScatteringMaterial);
}

// Start loading models
loadModels(0);

// Function to remove the directional light
function removeDirectionalLight() {
  // Remove all directional lights
  const directionalLights = scene.children.filter((child) => {
    // Check if the child is a DirectionalLight before accessing isDirectionalLight
    return child.type === 'DirectionalLight';
  });

  directionalLights.forEach((directionalLight) => scene.remove(directionalLight));
}

if (dayNightToggle) {
  dayNightToggle.addEventListener('change', () => {
    const toggleStartTime = performance.now();
    isDayMode = !isDayMode;

    // Show the spinner at the beginning
    progressContainer.style.display = 'flex';
    // Use requestAnimationFrame to ensure the spinner is rendered before proceeding
    requestAnimationFrame(() => {
      if (isDayMode) {
        const modeSwitchStartTime = performance.now();
        // Switch to day mode (remove night lights, add day lights)
        addDirectionalLight(scene);

        // Add a new directional light for day mode      
        renderer.toneMappingExposure = 0.5;

        // Set the background color to white
        scene.background = new THREE.Color(0xffffff);

        for (const modelName in loadedModelsMap) {
          const modelData = loadedModelsMap[modelName];
          if (modelData.scene) {
            modelData.scene.traverse(function (child: THREE.Object3D) {
              if ((child as THREE.Light).isLight) {
                let l = child as THREE.PointLight;
                l.power = 0;
              }
            });
          }
        }

        // Introduce a delay before logging the end time for mode switch
        setTimeout(() => {
          const modeSwitchEndTime = performance.now(); // Record the end time
          const modeSwitchDuration = modeSwitchEndTime - modeSwitchStartTime; // Calculate the duration
          console.log(`Day mode switch completed in ${modeSwitchDuration} milliseconds`);

          // Hide the spinner after a minimum duration
          setTimeout(() => {
            progressContainer.style.display = 'none';
          }, 0); // Adjust the minimum duration as needed
        }, 0); // Adjust the delay time as needed
      } else {

        const modeSwitchStartTime = performance.now();
        // Switch to night mode (remove day lights, remove directional light)

        removeDirectionalLight();
        renderer.toneMappingExposure = 0.25;

        // Set the background color to black
        scene.background = new THREE.Color(0x000000);

        for (const modelName in loadedModelsMap) {
          const modelData = loadedModelsMap[modelName];
          if (modelData.scene) {
            modelData.scene.traverse(function (child: THREE.Object3D) {
              if ((child as THREE.Light).isLight) {
                let l = child as THREE.PointLight;
                l.power = 400;
              }
            });
          }
        }

        // Introduce a delay before logging the end time for mode switch
        setTimeout(() => {
          const modeSwitchEndTime = performance.now(); // Record the end time
          const modeSwitchDuration = modeSwitchEndTime - modeSwitchStartTime; // Calculate the duration
          console.log(`Night mode switch completed in ${modeSwitchDuration} milliseconds`);

          // Hide the spinner after a minimum duration
          setTimeout(() => {
            progressContainer.style.display = 'none';
          }, 0); // Adjust the minimum duration as needed
        }, 0); // Adjust the delay time as needed
      }

      const toggleEndTime = performance.now(); // Record the end time
      const toggleDuration = toggleEndTime - toggleStartTime; // Calculate the duration
      console.log(`Day/Night toggle completed in ${toggleDuration} milliseconds`);
    });
  });
} else {
  // console.error("Element with id 'dayNightToggle' not found.");
}

// Function for changing material variants
function changeMaterialVariant(model: THREE.Object3D, selectedMeshNames: string[], materialName: string) {
  // Check if the model is a valid Object3D instance
  if (!(model instanceof THREE.Object3D)) {
    console.error("Model is not a valid Object3D instance");
    return;
  }

  const selectedJsonData = jsonFiles[materialName];
  if (!selectedJsonData) {
    console.error("JSON data for material not found:", materialName);
    return;
  }

  let meshesToProcess: THREE.Mesh[] = [];

  // Check if model is a valid Object3D instance before traversing
  if (model instanceof THREE.Object3D) {
    model.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh && node.material) {
        if (!selectedMeshNames || selectedMeshNames.includes(node.name)) {
          meshesToProcess.push(node);
        }
      }
    });
  }

  meshesToProcess.forEach(async (node) => {
    const originalMaterial = originalMaterials.get(node.uuid);
    if (originalMaterial) {
      if (originalMaterial instanceof THREE.Material) {
        if (Array.isArray(node.material)) {
          node.material = originalMaterial;
        } else {
          node.material.copy(originalMaterial);
        }
      } else if (Array.isArray(originalMaterial)) {
        if (Array.isArray(node.material)) {
          node.material = originalMaterial;
        } else if (node.material instanceof THREE.Material) {
          node.material.copy(originalMaterial[0]);
        }
      }
    } else {
      const newMaterial = await createMaterialFromJSON(selectedJsonData);
      if (newMaterial) {
        node.material = newMaterial.clone();
      } else {
        console.error("Failed to create material for node:", node);
      }
    }
  });
}

function processJsonData() {
  fetch("https://d2629xvaofl3d3.cloudfront.net/Materials.json")
    .then((response) => response.json())
    .then((data) => {
      jsonFiles = data;

      const materialbuttonsofa = document.querySelectorAll(
        ".material-thumbnail-sofa"
      );
      const materialbuttonmetal = document.querySelectorAll(
        ".material-thumbnail-metal"
      );
      const materialbuttonglass = document.querySelectorAll(
        ".material-thumbnail-glass"
      );
      const materialbuttonwall = document.querySelectorAll(
        ".material-thumbnail-wall"
      );

      Array.from(materialbuttonsofa).forEach((item) => {
        item.addEventListener("dragstart", (e) => {
          const thumbnail = e.target as HTMLElement | null;
          const materialName = thumbnail?.dataset.material;
          if (materialName) {
            console.log('Material button clicked:', materialName);
            changeMaterialVariant(
              loadedSofa,
              [
                "_ArmSupport",
                "ArmSupport001",
                "_Back",
                "Back001",
                "_BackSupport",
                "BackSupport001",
                "_Base",
                "_Seat",
                "Seat001",
              ],
              materialName
            );
          }
        });

        item.addEventListener("dragend", (e) => {
          const thumbnail = e.target as HTMLElement | null;
          const materialName = thumbnail?.dataset.material;
          if (materialName) {
            console.log('Material button dragend:', materialName);
            changeMaterialVariant(
              loadedSofa,
              [
                "_ArmSupport",
                "ArmSupport001",
                "_Back",
                "Back001",
                "_BackSupport",
                "BackSupport001",
                "_Base",
                "_Seat",
                "Seat001",
              ],
              materialName
            );
          }
        });
      });

      Array.from(materialbuttonmetal).forEach((item) => {
        item.addEventListener("dragstart", (e) => {
          const thumbnail = e.target as HTMLElement | null;
          const materialName = thumbnail?.dataset.material;
          if (materialName) {
            console.log('Material button clicked:', materialName);
            changeMaterialVariant(
              loadedmetal,
              ["Box002", "Box003", "Circle001"],
              materialName
            );
          }
        });

        item.addEventListener("dragend", (e) => {
          const thumbnail = e.target as HTMLElement | null;
          const materialName = thumbnail?.dataset.material;
          if (materialName) {
            changeMaterialVariant(
              loadedmetal,
              ["Box002", "Box003", "Circle001"],
              materialName
            );
          }
        });
      });

      Array.from(materialbuttonglass).forEach((item) => {
        item.addEventListener("dragstart", (e) => {
          const thumbnail = e.target as HTMLElement | null;
          const materialName = thumbnail?.dataset.material;
          if (materialName) {
            console.log('Material button clicked:', materialName);
            changeMaterialVariant(
              loadedmetal,
              ["Rectangle005"],
              materialName
            );
          }
        });

        item.addEventListener("dragend", (e) => {
          const thumbnail = e.target as HTMLElement | null;
          const materialName = thumbnail?.dataset.material;
          if (materialName) {
            changeMaterialVariant(
              loadedmetal,
              ["Rectangle005"],
              materialName
            );
          }
        });
      });

      Array.from(materialbuttonwall).forEach((item) => {
        item.addEventListener("dragstart", (e) => {
          const thumbnail = e.target as HTMLElement | null;
          const materialName = thumbnail?.getAttribute('data-material');
          if (materialName) {
            console.log('Material button clicked:', materialName);
            changeMaterialVariant(loadedwall, [], materialName);
          }
        });

        item.addEventListener("dragend", (e) => {
          const thumbnail = e.target as HTMLElement | null;
          const materialName = thumbnail?.getAttribute('data-material');
          if (materialName) {
            changeMaterialVariant(loadedwall, [], materialName);
          }
        });
      });

    })
    .catch((error) => console.error("Error loading JSON file:", error));
}

function storeOriginalMaterials(model: THREE.Object3D) {
  model.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material, index) => {
            if (material && typeof material.clone === 'function') {
              originalMaterials.set(`${mesh.name}-${index}`, material.clone());
            }
          });
        } else {
          const material = mesh.material as THREE.Material;
          if (material && typeof material.clone === 'function') {
            originalMaterials.set(mesh.name, material.clone());
          }
        }
      }
    }
  });
}

const stats = new Stats();
document.body.appendChild(stats.dom);

// Get the checkbox element
const statsToggleCheckbox = document.getElementById('statsToggle') as HTMLInputElement;

// Add event listener if the checkbox element exists
if (statsToggleCheckbox) {
  statsToggleCheckbox.addEventListener('change', () => {
    if (statsToggleCheckbox.checked) {
      // If checkbox is checked, show Stats
      stats.dom.style.display = 'block';
    } else {
      // If checkbox is unchecked, hide Stats
      stats.dom.style.display = 'none';
    }
  });
} else {
  console.error("Element with id 'statsToggle' not found.");
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  render();

  // _composer.render();

  stats.update();
}

processJsonData();

function render() {
  renderer.render(scene, camera);
  if (_composer) {
    _composer.render();
  }
}

animate();