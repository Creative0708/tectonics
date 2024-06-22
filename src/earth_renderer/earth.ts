// translation of https://schneide.blog/2016/07/15/generating-an-icosphere-in-c/
// and http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html

import vertShaderObj from "./shader/vert.glsl";
import fragShaderObj from "./shader/frag.glsl";

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
}

export const canvas = document.createElement("canvas");

function calculateDimensions() {
    const dimension = Math.min(innerWidth, innerHeight) * 0.75 | 0;
    canvas.width = dimension; canvas.height = dimension;
}

addEventListener("resize", calculateDimensions);
calculateDimensions();

const gl = canvas.getContext("webgl2", { powerPreference: "low-power" });
if (!gl)
    throw Error("webgl2 is not supported D:");

gl.enable(gl.CULL_FACE);

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

const transformationMatrixUniform = gl.getUniformLocation(program, vertShaderObj.uniforms.transform.variableName);

