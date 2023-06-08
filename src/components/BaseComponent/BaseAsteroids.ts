import { ref, type Ref } from 'vue';
import type { Asteroid, CanvasSize, ShipProperties } from "@/core/interfaces/AsteroidInterface";

export default function createAsteroids(FPS: number, CANVAS_SIZE: CanvasSize, ctx: Ref, ship: ShipProperties, SHIP_SIZE: number) {
    const ROIDS_JAG: number = 0.6; // jaggedness of the asteroid (0 = none, 1 = lots) 
    const ROIDS_NUM: number = 5; // starting number of asteroids
    const ROIDS_SIZE: number = 100; // starting size of asteroids in pixels
    const ROIDS_SPD: number = 50; // max starting speed of asteroids in pixels per second
    const ROIDS_VERT: number = 10; // average number of vertices on each asteroid 

    const roids = ref<Array<Asteroid>>([]);
    

    /**
     * newAsteroid
     * @param x - x coord of asteroid
     * @param y - y coord of asteroid
     * @return Asteroid
     */
    const newAsteroid = (x: number, y: number): Asteroid => {
        let roid: Asteroid = {
            x: x,
            y: y,
            xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
            yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
            r: ROIDS_SIZE / 2,
            a: Math.random() * Math.PI * 2,
            vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
            offs: []
        };
  
        // create the vertex offsets array
        for (let i = 0; i < roid.vert; i++) {
            roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
        }
  
        return roid;
    }
  
    const distBetweenPoints = (x1: number, y1: number, x2: number, y2: number): number => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
  
    /**
     * createAsteroidBelt
     * @return void 
     */
    const createAsteroidBelt = (): void => {
        roids.value = [];
        let x, y;
        for (let i = 0; i < ROIDS_NUM; i++) {
            do {
                x = Math.floor(Math.random() * CANVAS_SIZE.width);
                y = Math.floor(Math.random() * CANVAS_SIZE.height);
            } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
            roids.value.push(newAsteroid(x, y));
        }
    }
  
    /**
    * handleDrawAsteroids
    */
    const handleDrawAsteroids = (): void => {
        ctx.value!.strokeStyle = "slategrey";
        ctx.value!.lineWidth = SHIP_SIZE / 20;
        for (let i = 0; i < roids.value.length; i++) {
            let { x, y, r, a, vert, offs } = roids.value[i];
        
            // draw a path 
            ctx.value!.beginPath();
            ctx.value!.moveTo(
                x + r * offs[0] * Math.cos(a),
                y + r * offs[0] * Math.sin(a)
            );
            // draw the polygon
            for (let j = 1; j < vert; j++) {
                ctx.value!.lineTo(
                    x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                    y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert),
                );
            };
            ctx.value!.closePath();
            ctx.value!.stroke();
        
            // move the asteroid
            roids.value[i].x += roids.value[i].xv;
            roids.value[i].y += roids.value[i].yv;
            // handle edge of screen
            if (roids.value[i].x < 0 - roids.value[i].r) {
                roids.value[i].x = CANVAS_SIZE.width + roids.value[i].r;
            } else if (roids.value[i].x > CANVAS_SIZE.width + roids.value[i].r) {
                roids.value[i].x = 0 - roids.value[i].r;
            }
        
            if (roids.value[i].y < 0 - roids.value[i].r) {
                roids.value[i].y = CANVAS_SIZE.height + roids.value[i].r;
            } else if (roids.value[i].y > CANVAS_SIZE.height + roids.value[i].r) {
                roids.value[i].y = 0 - roids.value[i].r;
            }
        }
    }

    return {
        handleDrawAsteroids,
        createAsteroidBelt
    }
}
