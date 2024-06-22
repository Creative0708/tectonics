
export { canvas } from "./earth";
import * as Earth from "./earth";

export const fpsElement = document.createElement("div");
fpsElement.id = "fps";

const fpsQueue: number[] = [];

let prevTime: number | null = null;
function update(timestamp: number) {
    let deltaTime = 0;
    if (prevTime != null)
        deltaTime = Math.min((timestamp - prevTime) / 1000, 0.1); // cap delta time to prevent huge animation skips
    prevTime = timestamp;

    Earth.render();

    {
        let fps = 1 / deltaTime;
        fpsQueue.push(fps);
        if (fpsQueue.length > 30)
            fpsQueue.shift();

        fpsElement.textContent = "FPS: " + Math.round(fpsQueue.reduce((a, b) => a + b) / fpsQueue.length);
    }

    requestAnimationFrame(update);
}
requestAnimationFrame(update);
