
import * as EarthRenderer from "./earth_renderer";
import { orthographic } from "./earth_renderer/matrix";

import "/assets/style.css";

console.log(orthographic(10, 10, 10));

document.querySelector("#earth-container")!.appendChild(EarthRenderer.canvas);
document.body.appendChild(EarthRenderer.fpsElement);