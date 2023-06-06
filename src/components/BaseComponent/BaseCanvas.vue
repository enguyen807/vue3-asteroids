<script setup lang="ts">
defineProps<{
  width: number;
  height: number
}>()
</script>

<template>
    <canvas id="gameCanvas" :width="width" :height="height"></canvas>
</template>
