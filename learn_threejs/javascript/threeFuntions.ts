import * as Three from "three";
import * as Tween from "@tweenjs/tween.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { hideElements, unhideElements } from "./webFunctions";

class SceneManager {
    camera: Three.PerspectiveCamera;
    scene: Three.Scene;
    orbitControls: boolean;
    sceneChangeEvent: CustomEvent;
    scenes: Array<string>;
    switchActive: boolean;
    landmarks: Array<string>;
    currentScene: string;

    initialScene: InitializeScene;
    londonScene: LondonScene;
    dvdScene: DVDScene;

    constructor(scene, camera, currentScene = "-1") {
        this.sceneChangeEvent = new CustomEvent("onSceneChange", {});
        this.camera = camera;
        this.scene = scene;
        this.orbitControls = false;
        this.switchActive = false;
        this.scenes = ["preInit", "init", "BigBen", "ToriiGate"];
        this.currentScene = currentScene === "-1" ? this.scenes[0] : currentScene;

        this.initialScene = new InitializeScene(scene, camera, this);
        this.londonScene = new LondonScene(scene, camera);
        this.dvdScene = new DVDScene(scene, camera, this);
    }

    async switchScene(sceneName, event, object) {

        if (this.currentScene !== this.scenes[0]) {
            this.transitionScene(sceneName, object);
        }

        switch (sceneName) {
            case this.scenes[1]:
                if (this.currentScene === this.scenes[0]) {
                    this.initialScene.loadGlobe();
                    await new Promise(i => setTimeout(i, 700));
                    window.dispatchEvent(event);

                    console.log("loaded");

                    window.addEventListener("wheel", this.initialScene.listenerHandler);
                    window.addEventListener("touchmove", this.initialScene.listenerHandler); 

                    this.initialScene.lightingSetup();
                    this.initialScene.starSetup();
                    this.resizeCamera(false);

                    this.camera.lookAt(0, 0, -2100);
                }

                break;
        
            case this.scenes[2]:

                break;
        
            case this.scenes[3]:

                window.addEventListener("onSceneChange", () => {
                    this.dvdScene.cameraSetup();
                    this.dvdScene.environmentSetup();

                    hideElements("fogWall");

                    this.switchActive = false;
                });

                if (this.currentScene === this.scenes[0]) {
                    window.dispatchEvent(this.sceneChangeEvent);
                }

                break;

            default:
                break;
        }

        this.currentScene = sceneName;
    }

    async transitionScene(sceneName, focusedObject) {
        if (this.currentScene === this.scenes[1]) {
            const tween = new Tween.Tween({
                x: this.camera.position.x, 
                y: this.camera.position.y, 
                z: this.camera.position.z})
                    .to({x: focusedObject.position.x, 
                        y: focusedObject.position.y - 0.5, 
                        z: focusedObject.position.z + 10}, 2800)
                    .easing(Tween.Easing.Cubic.InOut);

            tween.onUpdate((object: {x:number, y:number, z:number}) => {
                this.camera.position.set(object.x, object.y, object.z);
            });     
            tween.start();

            tween.onComplete(() => {
                this.clearScene();
                window.dispatchEvent(this.sceneChangeEvent);});

            await new Promise(i => setTimeout(i, 1600));
            unhideElements("fogWall");
            hideElements("nameContainer");
            await new Promise(i => setTimeout(i, 1600));
        }
    }

    clearScene() {
        this.scene.remove.apply(this.scene, this.scene.children);
    }

    resizeCamera(isInitialized) {
        const boxWidth = Math.log1p(window.innerWidth) ** 2 / 2;
        const cameraPosition = new Three.Vector3(-boxWidth + 9.3, 0.7, 152);

        if (isInitialized && this.currentScene === this.scenes[1]) {
            this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        } else if (this.scenes.indexOf(this.currentScene) >= 2) {
            this.camera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        } else {this.camera.position.set(0, 0, -2000);}

        console.log("ss")
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}


class DVDScene {
    scene: Three.Scene;
    camera: Three.PerspectiveCamera;
    sceneManager: SceneManager;
    gltfLoader: GLTFLoader;

    enclosure: Three.Mesh;
    dvd: Three.Mesh;
    dvdDirection: Three.Vector3;

    constructor(scene, camera, sceneManager) {
        this.sceneManager = sceneManager;
        this.scene = scene;
        this.camera = camera;
        this.gltfLoader = new GLTFLoader();

        this.enclosure = new Three.Mesh();
        this.dvd = new Three.Mesh();
        this.dvdDirection = new Three.Vector3(-0.5,0.6,-0.5);
    }

    cameraSetup() {
        this.camera.position.set(20, 0, 10);
        this.sceneManager.orbitControls = true;
    }

    environmentSetup() {
        const sun = new Three.HemisphereLight(0xfffffff, 1.9);
        sun.position.set(0,3,0);
        const dvd = new Three.BoxGeometry(1, 1, 1);
        const dvdColor = new Three.MeshBasicMaterial({color: 0xffffff});
        const dvdMesh = new Three.Mesh(dvd, dvdColor);

        dvdMesh.receiveShadow = true;
        dvdMesh.castShadow = true;

        this.gltfLoader.load("../assets/DVD/DVDenclosureGLTF.gltf", (obj) => {
            this.enclosure = obj;
            this.dvd = dvdMesh;

            let enclosureWalls = obj.scene.children[2].children[0];
            enclosureWalls.material = obj.scene.children[2].children[0].material.clone();
            enclosureWalls.material.transparent = true;
            enclosureWalls.material.opacity = 0;
            this.scene.add(sun, obj.scene, dvdMesh);
            dvdMesh.position.set(0, 0, 0);
            console.log(obj.scene)
        }, () => {}, console.log);

        Array(6200).fill().forEach(element => {
            const geometry = new Three.SphereGeometry(1, 10, 10);
            const material = new Three.MeshBasicMaterial();
            const star = new Three.Mesh(geometry, material);
            const [x,y,z] = new Array(3).fill().map(() => Three.MathUtils.randFloatSpread(5000));
            star.position.set(x, y, z);
            this.scene.add(star);
        });
    }

    dvdCollisions() {
        const enclosureEdge = 0;
        const dvdSpeed = 4;
        const enclosureSize = new Three.Vector3(1 - enclosureEdge, 1 - enclosureEdge, 1.5 - enclosureEdge);

        const collisions = {
            "x": Math.abs(this.dvd.position.x) >= enclosureSize.x,
            "y": Math.abs(this.dvd.position.y) >= enclosureSize.y,
            "z": Math.abs(this.dvd.position.z) >= enclosureSize.z,
        }

        if (Math.abs(this.dvd.position.x) >= enclosureSize.x 
            || Math.abs(this.dvd.position.y) >= enclosureSize.y
            || Math.abs(this.dvd.position.z) >= enclosureSize.z) {
            
            console.log("collision", this.dvd.position, collisions.x, collisions.y, collisions.z, this.dvdDirection);
            this.dvdDirection = new Three.Vector3(
                this.dvdDirection.x * (collisions.x ? -1 : 1),
                this.dvdDirection.y * (collisions.y ? -1 : 1),
                this.dvdDirection.z * (collisions.z ? -1 : 1),
            );
            
            const randomRGBValue = () => Math.random();
            this.dvd.material.color.setRGB(randomRGBValue(), randomRGBValue(), randomRGBValue());
        }

        this.dvd.position.x += this.dvdDirection.x / dvdSpeed;
        this.dvd.position.y += this.dvdDirection.y / dvdSpeed;
        this.dvd.position.z += this.dvdDirection.z / dvdSpeed;
    }
}


class LondonScene {
    scene: Three.Scene;
    camera: Three.PerspectiveCamera;

    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
    }

    cameraSetup() {

    }
}


class InitializeScene {
    gltfLoader: GLTFLoader;
    globe: any;
    scene: Three.Scene;
    camera: Three.PerspectiveCamera;
    sceneManager: SceneManager;
    listenerHandler: any;


    constructor(scene, camera, sceneManager) {
        this.listenerHandler = () => this.enterScene();
        this.globe = new Three.SphereGeometry(5, 30, 30, 0);
        this.gltfLoader = new GLTFLoader();
        this.scene = scene;
        this.camera = camera;
        this.sceneManager = sceneManager;
    }

    loadGlobe() {
        this.gltfLoader.load("assets/globe/globeGLTF.gltf", (obj) => {
            obj.scene.traverse(function (object) {
                // const objHelper = new Three.BoxHelper(object);
                // scene.add(objHelper);
                if (object.isMesh) {
                    // object.material.flatShading = Three.SmoothShading;
                    object.castShadow = true;
                    object.receiveShadow = true;
                    object.name = "globe";
                }   
            });
            this.globe = obj;
            this.globe.scene.position.set(0,0,100)
            this.globe.scene.rotation.set(0, 0.1, 0)
            this.globe.scene.scale.set(1.2, 1.2, 1.2);
            this.globe.scene.name = "globe";
            this.scene.add(this.globe.scene);
            //unhideElements();
        }, async (progress) => {
            const progressTotal = Math.round(progress.loaded / progress.total);
            const progressText = document.getElementById("loadProgressText");
            progressText.innerText = progressTotal * 100 + " %";
        });
    }

    enterScene() {
        window.removeEventListener("touchmove", this.listenerHandler); 
        window.removeEventListener("wheel", this.listenerHandler); 
        this.zoomToGlobe();
        this.sceneManager.currentScene = this.sceneManager.scenes[1];
        new Promise(i => setTimeout(async () => {
            hideElements("loadEnterText");
            new Promise(j => setTimeout(() => {
                unhideElements("nameContainer");
            }, 2300));
        }, 5000));
    }

    lightingSetup() {
        const naturalLight = new Three.HemisphereLight(0x858585, 1, 1.3);
        naturalLight.scale.set(10, 10, 10);
        naturalLight.position.set(-10, 5, 250);

        const sunLight = new Three.DirectionalLight(0x858585, 1.4);
        sunLight.shadow.bias = -0.0005
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;

        const shadowSide = 20;
        sunLight.shadow.camera.top = shadowSide;
        sunLight.shadow.camera.bottom = -shadowSide;
        sunLight.shadow.camera.left = -shadowSide;
        sunLight.shadow.camera.right = shadowSide;

        sunLight.scale.set(10, 10, 10);
        sunLight.position.set(200, 0, 380);
        this.scene.add(naturalLight, sunLight);
    }

    starSetup() {
        Array(4200).fill().forEach(element => {
            const geometry = new Three.SphereGeometry(1, 10, 10);
            const material = new Three.MeshStandardMaterial();
            const star = new Three.Mesh(geometry, material);
            const [x,y] = new Array(3).fill().map(() => Three.MathUtils.randFloatSpread(2500));
            const z = Three.MathUtils.randFloatSpread(8000);
            star.position.set(x, y, -Math.abs(z) - 700);
            this.scene.add(star);
        });
    }

    zoomToGlobe() {
        const boxWidth = Math.log1p(window.innerWidth) ** 2 / 2;
        const cameraPosition = new Three.Vector3(-boxWidth + 9.3, 0.7, 152);

        const tween = new Tween.Tween({
            x: this.camera.position.x, 
            y: this.camera.position.y, 
            z: this.camera.position.z})
                .to({x: 0, y: 18, z: 150}, 4000)
                .easing(Tween.Easing.Cubic.InOut)

        const tween1 = new Tween.Tween({x: 0, y: 18, z: 150})
        .to({
            x: cameraPosition.x,
            y: cameraPosition.y, 
            z: cameraPosition.z}, 4000)
                .easing(Tween.Easing.Cubic.InOut)
        
        tween.chain(tween1);

        tween.onUpdate((object: {x:number, y:number, z:number}) => {
            this.camera.position.set(object.x, object.y, object.z)
        });
        tween1.onUpdate((object: {x:number, y:number, z:number}) => {
            this.camera.position.set(object.x, object.y, object.z)
        });
        tween.start()
    }
}

export { InitializeScene, SceneManager }