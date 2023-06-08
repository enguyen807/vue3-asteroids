<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import createSpaceship from "@/components/BaseComponent/BaseSpaceship";
import createAsteroids from "@/components/BaseComponent/BaseAsteroids";
import type { CanvasSize } from "@/core/interfaces/AsteroidInterface";

const FPS: number = 30; // frames per second
const CANVAS_SIZE: CanvasSize = {
  width: 700,
  height: 500
};

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

const {
    ship,
    SHIP_SIZE,
    handleDrawShip,
    handleRotateShip,
    handleShipThrust,
    handleScreenEdge,
    handleMoveShip,
    handleKeyDown,
    handleKeyUp
} = createSpaceship(FPS, CANVAS_SIZE, ctx);

const { handleDrawAsteroids, createAsteroidBelt } = createAsteroids(FPS, CANVAS_SIZE, ctx, ship, SHIP_SIZE);

const init = (): void => {
  handleDrawSpace();
  handleDrawShip(),
  handleRotateShip(),
  handleShipThrust(),
  handleScreenEdge(),
  handleMoveShip(),
  handleDrawAsteroids();
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
