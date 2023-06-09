import { reactive, type Ref, onMounted } from 'vue';
import type { ShipProperties, CanvasSize } from "@/core/interfaces/AsteroidInterface";

export default function createSpaceship(FPS: number, CANVAS_SIZE: CanvasSize, ctx: Ref) {
    const LASER_MAX: number = 10; // max number of laser on the screen
    const LASER_SPD: number = 500; // speed of lasers in pixels per second
    const LASER_DIST: number = 0.4; // max distance laser can travel as fraction of screen width
    const LASER_EXPLODE_DUR: number = 0.1; // duration of the lasers' explosion in seconds

    const FRICTION: number = 0.9; // friction coefficient of space (0 = no friction, 1 - lots of friction)
    const SHIP_SIZE: number = 30; // ship height in pixels
    const TURN_SPEED: number = 360; // turn speed in degrees per sec
    const SHIP_ACCEL: number = 5; // acceleration of ship in pixels per second 
    const SHIP_EXPLODE_DUR: number = 10; // duration of the ship's explosion
    const SHIP_INVULNERABLE_DUR: number = 3; // duration of the ship's invulnerability
    const SHIP_BLINK_DUR = 0.1; // duration of ship's blink during invulnerability
    const INITIAL_SHIP_STATE: ShipProperties = {
        x: CANVAS_SIZE.width / 2,
        y: CANVAS_SIZE.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI,
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        blinkNum: Math.ceil(SHIP_INVULNERABLE_DUR / SHIP_BLINK_DUR),
        explodeTime: 0,
        rotate: 0,
        thrusting: false,
        thrust: {
          x: 0,
          y: 0
        },
        canShoot: true,
        lasers: []
    };

    const ship: ShipProperties = reactive({...INITIAL_SHIP_STATE});

    /**
     * handleDrawShip - draws the ship
     * @return void
     */
    const handleDrawShip = (): void => {
        // draw triangular ship
        ctx.value!.strokeStyle = "white";
        ctx.value!.lineWidth = SHIP_SIZE / 20;
        ctx.value!.beginPath();
        ctx.value!.moveTo( // nose of the ship
            ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
        );
        ctx.value!.lineTo( // rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
        );
        ctx.value!.lineTo( // rear right
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
        );
        ctx.value!.closePath();
        ctx.value!.stroke();
    }
    

    const handleCreateShipExplosion = () => {
        const explosionColours = ['darkred', 'red', 'orange', 'yellow', 'white'];
        let initialR = 1.7;
        for(let i = 0; i < explosionColours.length; i++) {
            ctx.value!.fillStyle = explosionColours[i];
            ctx.value!.beginPath();
            ctx.value!.arc(ship.x, ship.y, (initialR -= 0.3) * ship.r, 0, 2 * Math.PI, false);
            ctx.value!.fill();
        }
    }

    
    /**
     * handleShipExplosion - Set ship's status to explosion
     */
    const handleExplodeShip = () => {      
        ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * 2)
    }
  
    /**
     * handleRotateShip - rotates ship
     * @return void;
     */
    const handleRotateShip = (): void => {
        ship.a += ship.rotate;
    }
  
    /**
     * handleDrawThrusters - draw the thrusters
     * @return void;
     */
    const handleDrawThrusters = (): void => {
        ctx.value!.fillStyle = "yellow";
        ctx.value!.strokeStyle = "red";
        ctx.value!.lineWidth = SHIP_SIZE / 10;
        ctx.value!.beginPath();
        ctx.value!.moveTo( // rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        ctx.value!.lineTo( // rear center behind ship
            ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
            ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
        );
        ctx.value!.lineTo( // rear right
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        ctx.value!.closePath();
        ctx.value!.fill();
        ctx.value!.stroke();
    }
  
    /**
     * handleShipThrust - thrust ship forward
     * @return void;
     */
    const handleShipThrust = (): void => {
        if (ship.thrusting) {
            ship.thrust.x += SHIP_ACCEL * Math.cos(ship.a) / FPS;
            ship.thrust.y -= SHIP_ACCEL * Math.sin(ship.a) / FPS;
            handleDrawThrusters();
        } else {
            ship.thrust.x -= FRICTION * ship.thrust.x / FPS
            ship.thrust.y -= FRICTION * ship.thrust.y / FPS
        }
    }

    /**
     * handleScreenEdge - handles what happens when screen approaches edge of screen
     * @return void;
     */
    const handleScreenEdge = (): void => {
        if (ship.x < 0 - ship.r) {
            ship.x = CANVAS_SIZE.width + ship.r;
        } else if (ship.x > CANVAS_SIZE.width + ship.r) {
            ship.x = 0 - ship.r;
        }

        if (ship.y < 0 - ship.r) {
            ship.y = CANVAS_SIZE.width + ship.r;
        } else if (ship.y > CANVAS_SIZE.width + ship.r) {
            ship.y = 0 - ship.r;
        }
    }
  
    /**
     * handleMoveShip - move ship forward
     * @return void;
     */
    const handleMoveShip = (): void => {
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    }

    /**
     * handleLaserMovement - move lasers
     * @return void;
     */
    const handleLaserMovement = (): void => {
        for (let i = ship.lasers.length - 1; i >= 0; i--) {
            // check distance traveled
            if (ship.lasers[i].dist > LASER_DIST * CANVAS_SIZE.width) {
                ship.lasers.splice(i, 1);
                continue;
            }

            if (ship.lasers[i].explodeTime > 0) {
                ship.lasers[i].explodeTime--;

                // destroy the laser when duration is up
                if (ship.lasers[i].explodeTime === 0) {
                    ship.lasers.splice(i, 1);
                    continue;
                }

            } else {
                // move lasers
                ship.lasers[i].x += ship.lasers[i].xv;
                ship.lasers[i].y += ship.lasers[i].yv;

                // calc distance of laser travel    
                ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2))
            }

            // handle edge of screen
            if (ship.lasers[i].x < 0) {
                ship.lasers[i].x = CANVAS_SIZE.width;
            } else if (ship.lasers[i].x > CANVAS_SIZE.width) {
                ship.lasers[i].x = 0;
            }

            if (ship.lasers[i].y < 0) {
                ship.lasers[i].y = CANVAS_SIZE.height;
            } else if (ship.lasers[i].y > CANVAS_SIZE.height) {
                ship.lasers[i].y = 0;
            }
        }
    }

    /**
     * handleDrawLaser - draw lasers
     * @return void;
     */
    const handleDrawLaser = (): void => {
        for (let i = 0; i < ship.lasers.length; i++) {
            const { x, y } = ship.lasers[i];

            if (ship.lasers[i].explodeTime === 0) {
                ctx.value!.beginPath();
                ctx.value!.arc(x, y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
                ctx.value!.lineWidth = 5;

                ctx.value!.strokeStyle = "salmon";
                ctx.value!.stroke();
            } else {
                // draw the explosion
                ctx.value!.fillStyle = "orangered";
                ctx.value!.beginPath();
                ctx.value!.arc(x, y, ship.r * 0.75, 0, Math.PI * 2, false);
                ctx.value!.fill();

                ctx.value!.fillStyle = "salmon";
                ctx.value!.beginPath();
                ctx.value!.arc(x, y, ship.r * 0.5, 0, Math.PI * 2, false);
                ctx.value!.fill();

                ctx.value!.fillStyle = "pink";
                ctx.value!.beginPath();
                ctx.value!.arc(x, y, ship.r * 0.25, 0, Math.PI * 2, false);
                ctx.value!.fill();
            }


        }
    }

    /**
     * handleShootLaser - shoots laser
     * @return void;
     */
    const handleShootLaser = (): void => {
        //create laser object
        
        // check if ship can shoot && laser array is less than max lasers on screen
        if (ship.canShoot && ship.lasers.length < LASER_MAX) {
            ship.lasers.push({
                x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                xv: LASER_SPD * Math.cos(ship.a) / FPS,
                yv: -LASER_SPD * Math.sin(ship.a) / FPS,
                dist: 0,
                explodeTime: 0
            });
        }

        // prevent further shooting
        ship.canShoot = false;
    }
  
    /**
     * handleKeyDown 
     * @param KeyboardEvent ev
     */
    const handleKeyDown = (ev: KeyboardEvent): void => {
        switch (ev.code) {
            case "Space": // shoot laser once per keydown. Once keyup is fired then shooting is enabled again
                handleShootLaser();
                break;
            case "ArrowLeft": // left arrow (rotate ship left)
                ship.rotate = TURN_SPEED / 180 * Math.PI / FPS;
                break;
            case "ArrowUp": // thrust ship forward
                ship.thrusting = true;
                break;
            case "ArrowRight": // right arrow (rotate ship right)
                ship.rotate = -TURN_SPEED / 180 * Math.PI / FPS;
                break;        
        }
    }
  
    /**
     * handleKeyUp
     * @param KeyboardEvent ev
     */
    const handleKeyUp = (ev: KeyboardEvent): void => {
        switch (ev.code) {
            case "Space": // laser will fire only once per keydown, keyup will enable shoot laser
                ship.canShoot = true;
                break;            
            case "ArrowLeft": // stop rotating left
                ship.rotate = 0;
                break;
            case "ArrowUp": // stop moving forward
                ship.thrusting = false;
                break;
            case "ArrowRight": // stop rotating right
                ship.rotate = 0;
                break;
        }
    }

    return {
        ship,
        INITIAL_SHIP_STATE,
        SHIP_SIZE,
        SHIP_BLINK_DUR,
        handleLaserMovement,
        handleDrawLaser,
        handleDrawShip,
        handleRotateShip,
        handleShipThrust,
        handleScreenEdge,
        handleMoveShip,
        handleKeyDown,
        handleKeyUp,
        handleExplodeShip,
        handleCreateShipExplosion,
    };
}