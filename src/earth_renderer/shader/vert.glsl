#version 300 es

precision mediump float;

uniform mat4 transform;

in vec3 pos;

void main() {
    gl_Position = transform * vec4(pos, 1.0f);
}