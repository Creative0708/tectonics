
export type Mat4x4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

export function identity(): Mat4x4 {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

export function orthographic(width: number, height: number, depth: number): Mat4x4 {
    return scale(2 / width, 2 / height, 2 / depth);
}

export function scale(x: number, y: number, z: number): Mat4x4 {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
    ];
}