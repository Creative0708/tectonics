
import * as EarthRenderer from "./earth_renderer";

import "/assets/style.css";

document.querySelector("#earth-container")!.appendChild(EarthRenderer.canvas);
document.body.appendChild(EarthRenderer.fpsElement);