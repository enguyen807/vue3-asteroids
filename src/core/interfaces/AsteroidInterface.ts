export interface CanvasSize {
    width: number;
    height: number;
}

export interface Asteroid {
    x: number,
    y: number,
    xv: number,
    yv: number,
    r: number,
    a: number,
    vert: number,
    offs: Array<number>,
}

export interface ShipThrust {
    x: number,
    y: number
}
  
export interface ShipProperties{
    x: number,
    y: number,
    r: number,
    a: number,
    blinkTime: number,
    blinkNum: number,
    explodeTime: number,
    rotate: number,
    thrusting: boolean,
    thrust: ShipThrust
}  
