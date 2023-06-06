<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import createSpaceship from "@/components/BaseComponent/BaseSpaceship.ts";

const CANVAS_SIZE: {width: number, height: number} = {
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
    handleDrawShip,
    handleRotateShip,
    handleShipThrust,
    handleScreenEdge,
    handleMoveShip,
    handleKeyDown,
    handleKeyUp
} = createSpaceship(CANVAS_SIZE, ctx);

const init = (): void => {
  handleDrawSpace();
  handleDrawShip(),
  handleRotateShip(),
  handleShipThrust(),
  handleScreenEdge(),
  handleMoveShip()
}

const { pause, resume, isActive } = useIntervalFn(init, 1000 / 30);

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
