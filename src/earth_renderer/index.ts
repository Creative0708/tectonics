import { IcosahedronGeometry, Mesh, MeshBasicMaterial, OrthographicCamera, Scene, WebGLRenderer } from "three";

let cameraSize = 2;

const scene = new Scene();
const camera = new OrthographicCamera(-cameraSize, cameraSize, cameraSize, -cameraSize);

const geometry = new IcosahedronGeometry(1, 25);
const material = new MeshBasicMaterial({ color: 0xff0000 });

const sphere = new Mesh(geometry, material);

scene.add(sphere);
camera.position.z = 5;


const renderer = new WebGLRenderer();

function calculateDimensions() {
    const dimension = Math.min(innerWidth, innerHeight) * 0.75 | 0;
    renderer.setSize(dimension, dimension);
}

addEventListener("resize", calculateDimensions);
calculateDimensions();

export const canvas = renderer.domElement;
export const fpsElement = document.createElement("div");
fpsElement.id = "fps";

const fpsQueue: number[] = [];

let prevTime: number | null = null;
function update(timestamp: number) {
    let deltaTime = 0;
    if (prevTime != null)
        deltaTime = Math.min((timestamp - prevTime) / 1000, 0.1); // cap delta time to prevent huge animation skips
    prevTime = timestamp;

    renderer.render(scene, camera);

    {
        let fps = 1 / deltaTime;
        fpsQueue.push(fps);
        if (fpsQueue.length > 30)
            fpsQueue.shift();

        fpsElement.textContent = "FPS: " + Math.round(fpsQueue.reduce((a, b) => a + b) / fpsQueue.length);
    }
}
renderer.setAnimationLoop(update);
