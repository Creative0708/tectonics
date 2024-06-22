
export type Mat4x4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

export function zero(): Mat4x4 {
    return [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ];
}

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

export function multiply(m1: Mat4x4, m2: Mat4x4): Mat4x4 {
    const res = zero();
    for (let i = 0; i < 4; ++i)
        for (let j = 0; j < 4; ++j)
            for (let k = 0; k < 4; ++k)
                res[i * 4 + j] += m1[i * 4 + k] * m2[k * 4 + j];
    return res;
}

// https://en.wikipedia.org/wiki/Rotation_matrix#General_3D_rotations
export function rotation(a: number, b: number, y: number): Mat4x4 {
    const sina = Math.sin(a), cosa = Math.cos(a);
    const sinb = Math.sin(b), cosb = Math.cos(b);
    const siny = Math.sin(y), cosy = Math.cos(y);

    return [
        cosb * cosy, sina * sinb * cosy - cosa * siny, cosa * sinb * cosy + sina * siny, 0,
        cosb * siny, sina * sinb * siny + cosa * cosy, cosa * sinb * siny - sina * cosy, 0,
        -sinb, sina * cosb, cosa * cosb, 0,
        0, 0, 0, 1
    ];
}