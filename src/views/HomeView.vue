<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import createSpaceship from "@/components/BaseComponent/BaseSpaceship";
import createAsteroids from "@/components/BaseComponent/BaseAsteroids";
import type { CanvasSize } from "@/core/interfaces/AsteroidInterface";
import { handleShowBounding, handleCentreDot } from '@/core/helpers';

// CONSTANTS
const FPS: number = 30; // frames per second
const CANVAS_SIZE: CanvasSize = {
  width: 700,
  height: 500
};

// REFS
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

// DESTRUCTURED FUNCTIONS
const {
    ship,
    SHIP_SIZE,
    INITIAL_SHIP_STATE,
    SHIP_BLINK_DUR,
    handleDrawShip,
    handleRotateShip,
    handleShipThrust,
    handleScreenEdge,
    handleMoveShip,
    handleKeyDown,
    handleKeyUp,
    handleExplodeShip,
    handleCreateShipExplosion,
} = createSpaceship(FPS, CANVAS_SIZE, ctx);

const { handleDrawAsteroids, createAsteroidBelt, roids, distBetweenPoints } = createAsteroids(FPS, CANVAS_SIZE, ctx, ship, SHIP_SIZE);

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
 * handleDebug - Enables all debug boundaries
 * @return void
 */
const handleDebug = (): void => {
  handleCentreDot(ctx, ship.x, ship.y);
  handleShowBounding(ctx, ship.x, ship.y, ship.r);
  for (let i = 0; i < roids.value.length; i++) {
    let { x, y, r } = roids.value[i];
    handleShowBounding(ctx, x, y, r);
    handleCentreDot(ctx, x, y);
  }
}



/**
 * handleCheckCollision - check collision between asteroid and ship
 * @return void
 */
const handleCheckCollision = (): void => {
  for (let i = 0; i < roids.value.length; i++) {
    if (distBetweenPoints(ship.x, ship.y, roids.value[i].x, roids.value[i].y) < ship.r + roids.value[i].r) {
      handleExplodeShip();
    }
  }
}


const init = (): void => {
  const blinkOn = ship.blinkNum % 2 === 0;
  const exploding = ship.explodeTime > 0;
  handleDrawSpace();
  handleScreenEdge();
  handleDrawAsteroids();
  if (!exploding) {
    handleRotateShip();
    handleMoveShip();
    if (blinkOn) {
      handleDrawShip();
      handleShipThrust();
    }

    if (ship.blinkNum > 0) {
      ship.blinkTime--;
      if (ship.blinkTime === 0) {
        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
        ship.blinkNum--;
      }
    } else {
      handleCheckCollision();
    }
  } else {
    handleCreateShipExplosion();

    ship.explodeTime--;
    if (ship.explodeTime === 0) {
      Object.assign(ship, INITIAL_SHIP_STATE);
    }
  }
}

const { pause, resume, isActive } = useIntervalFn(init, 1000 / FPS);

onMounted(() => {
  ctx.value = gameCanvas.value!.getContext("2d");
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  createAsteroidBelt();
})
</script>

<template>
  <main>
    <canvas ref="gameCanvas" :width="CANVAS_SIZE.width" :height="CANVAS_SIZE.height"></canvas>
  </main>
</template>
