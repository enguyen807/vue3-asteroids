<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useIntervalFn } from '@vueuse/core'

interface ShipThrust {
  x: number,
  y: number
}

interface ShipProperties{
  x: number,
  y: number,
  r: number,
  a: number,
  rotate: number,
  thrusting: boolean,
  thrust: ShipThrust
}

const FPS: number = 30; // frames per second 
const FRICTION: number = 0.7 // friction coefficient of space (0 = no friction, 1 - lots of friction)
const SHIP_SIZE: number = 30; // ship height in pixels
const TURN_SPEED: number = 360; // turn speed in degrees per sec
const SHIP_ACCEL: number = 5; // acceleration of ship in pixels per second 
const CANVAS_SIZE: {width: number, height: number} = {
  width: 700,
  height: 500
};
const ship: ShipProperties = reactive({
  x: CANVAS_SIZE.width / 2,
  y: CANVAS_SIZE.height / 2,
  r: SHIP_SIZE / 2,
  a: 90 / 180 * Math.PI, // convert to radians 
  rotate: 0,
  thrusting: false,
  thrust: {
    x: 0,
    y: 0
  }
});

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

/**
 * handleDrawSpace - draws space of the canvas
 * @return void
 */
const handleDrawSpace = (): void => {
  // draw space
  ctx.value!.fillStyle = "black";
  ctx.value!.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
}

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

/**
 * handleCentreDot - sets the middle of the ship
 * @return void;
 */
const handleCentreDot = (): void => {
  ctx.value!.fillStyle = "red";
  ctx.value!.fillRect(ship.x - 1, ship.y - 1, 2, 2);
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
 * handleMoveShip - move ship forward
 * @return void;
 */
 const handleMoveShip = (): void => {
  ship.x += ship.thrust.x;
  ship.y += ship.thrust.y;
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
 * handleKeyDown 
 * @param KeyboardEvent ev
 */
const handleKeyDown = (ev: KeyboardEvent): void => {
  switch (ev.code) {
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

const init = (): void => {
  handleDrawSpace();
  handleShipThrust();
  handleDrawShip();
  // handleCentreDot();
  handleMoveShip();
  handleRotateShip();
  handleScreenEdge();
}

const { pause, resume, isActive } = useIntervalFn(init, 1000 / FPS)

onMounted(() => {
  ctx.value = gameCanvas.value!.getContext("2d");
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
})
</script>

<template>
  <main>
    <canvas ref="gameCanvas" :width="CANVAS_SIZE.width" :height="CANVAS_SIZE.height"></canvas>
  </main>
</template>
