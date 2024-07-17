// translation of https://schneide.blog/2016/07/15/generating-an-icosphere-in-c/
// and http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html

import vertShaderObj from "./shader/vert.glsl";
import fragShaderObj from "./shader/frag.glsl";

import * as matrix from "./matrix";

const X = .525731112119133606;
const Z = .850650808352039932;

let vertices = [
    [-X, 0, Z], [X, 0, Z], [-X, 0, -Z], [X, 0, -Z],
    [0, Z, X], [0, Z, -X], [0, -Z, X], [0, -Z, -X],
    [Z, X, 0], [-Z, X, 0], [Z, -X, 0], [-Z, -X, 0]
];

let indices = [
    [0, 4, 1], [0, 9, 4], [9, 5, 4], [4, 5, 8], [4, 8, 1],
    [8, 10, 1], [8, 3, 10], [5, 3, 8], [5, 2, 3], [2, 7, 3],
    [7, 10, 3], [7, 6, 10], [7, 11, 6], [11, 0, 6], [0, 1, 6],
    [6, 1, 10], [9, 0, 11], [9, 11, 2], [9, 2, 5], [7, 2, 11]
];

function subdivide() {
    let newIndices = [];

    const midpoints = new Map();
    function hash(i1: number, i2: number): BigInt {
        return BigInt(i1) << BigInt(32) | BigInt(i2);
    }
    function getOrCreateMidpoint(i1: number, i2: number): number {
        let val = midpoints.get(hash(i1, i2));
        if (val)
            return val;
        const v1 = vertices[i1], v2 = vertices[i2];

        const newIndex = vertices.length;
        let x = (v1[0] + v2[0]) / 2,
            y = (v1[1] + v2[1]) / 2,
            z = (v1[2] + v2[2]) / 2;

        const normFac = 1 / Math.hypot(x, y, z);
        x *= normFac; y *= normFac; z *= normFac;

        vertices.push([
            x, y, z
        ]);
        midpoints.set(hash(i1, i2), newIndex);
        midpoints.set(hash(i2, i1), newIndex);
        return newIndex;
    }

    for (const triangle of indices) {
        const [i1, i2, i3] = triangle;
        const a = getOrCreateMidpoint(i1, i2);
        const b = getOrCreateMidpoint(i2, i3);
        const c = getOrCreateMidpoint(i1, i3);

        newIndices.push([i1, a, c]);
        newIndices.push([i2, b, a]);
        newIndices.push([i3, c, b]);
        newIndices.push([a, b, c]);
    }
    indices = newIndices;
}
for (let i = 0; i < 4; i++)
    subdivide();

export const canvas = document.createElement("canvas");

// basic webgl2 initialization

const gl = canvas.getContext("webgl2", { powerPreference: "low-power" });
if (!gl)
    throw Error("webgl2 is not supported D:");

gl.enable(gl.CULL_FACE);
gl.clearColor(1, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
gl.clearDepth(1);
gl.depthFunc(gl.LEQUAL);

// program compilation

const program = gl.createProgram();

function attachShader(shaderType: number, source: string): WebGLShader {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw Error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
    }
    gl.attachShader(program, shader);
    return shader;
}

const vertShader = attachShader(gl.VERTEX_SHADER, vertShaderObj.sourceCode);
const fragShader = attachShader(gl.FRAGMENT_SHADER, fragShaderObj.sourceCode);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw Error(`Shader linking error: ${gl.getProgramInfoLog(program)}`);

gl.useProgram(program);

// shader parameter setup

const transformationMatrixUniform = gl.getUniformLocation(program, vertShaderObj.uniforms.transform.variableName);

function handleResize() {
    const dimension = Math.min(innerWidth, innerHeight) * 0.75 | 0;
    canvas.width = dimension; canvas.height = dimension;
    gl.uniformMatrix4fv(transformationMatrixUniform,
        false,
        matrix.orthographic(3, 3, 10),
    );
    gl.viewport(0, 0, dimension, dimension);
}

addEventListener("resize", handleResize);
handleResize();

const positionVBO = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(0);

const colorVBO = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(1);
const arr = [];
for (let i = 0; i < vertices.length; i++)
    for (let j = 0; j < 3; j++)
        arr.push(Math.random())
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);

const indexVBO = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices.flat()), gl.STATIC_DRAW);


let mouseX: number | null = null, mouseY: number | null = null;
addEventListener("mousemove", (e) => {
    const windowMin = Math.min(innerWidth, innerHeight);
    mouseX = (e.pageX - innerWidth / 2) / windowMin;
    mouseY = (e.pageY - innerHeight / 2) / windowMin;
});

// rendering code!

let panX: number | null = null, panY: number | null = null;
export function render(deltaTime: number) {
    const now = Date.now() / 1000;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.DYNAMIC_DRAW);

    gl.drawElements(gl.TRIANGLES, indices.length * 3, gl.UNSIGNED_SHORT, 0);

    function damp(a: number | null, b: number | null): number | null {
        if (a === null)
            return b;

        const SMOOTHING = 1e-40;
        return a + (b - a) * SMOOTHING ** deltaTime;
    }

    panX = damp(panX, mouseX);
    panY = damp(panY, mouseY);

    const projectionMatrix = matrix.multiply(matrix.rotation(now * 0.03 + panY * 3, now * 0.15 + panX * 3, now * 0.06), matrix.orthographic(3, 3, -10));

    gl.uniformMatrix4fv(transformationMatrixUniform,
        false,
        projectionMatrix
    );
}

