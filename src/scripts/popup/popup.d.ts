
import * as THREE from "three";

export class Gully extends THREE.Group {
    shapes: Shape[]
}

export class Shape extends THREE.Group {
    gullies: Gully[]
}

export class Base extends Shape {
    interpolate(angle: number): void;
}

export class Fold extends Shape {
    constructor(origin: number,
                a: number,
                b: number,
                c: number,
                d: number,
                e: number,
                f: number,
                g: number);
}

export class ShapeControls extends THREE.EventDispatcher {
    shapes: Shape[];
    constructor(camera: THREE.Camera, dom: HTMLCanvasElement);
    update(): void;
}
