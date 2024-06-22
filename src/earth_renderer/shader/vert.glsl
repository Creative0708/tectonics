#version 300 es

precision mediump float;

uniform mat4 transform;

layout(location = 0) in vec3 pos;
layout(location = 1) in vec3 vertColor;

out vec3 color;

void main() {
    gl_Position = transform * vec4(pos, 1.0f);
    color = vertColor;
}