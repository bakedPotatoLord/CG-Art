<script setup lang="ts">
import { ref, onMounted } from "vue"

type vec2 = [number, number]
type vec4 = [number, number, number, number]


const canvas = ref<HTMLCanvasElement | null>(null)

const progress = ref("")

const cw = ref(1000);
const ch = ref(1000);

const mutateRate = 5

onMounted(async () => {
  console.log(canvas.value)

  if (canvas.value) {
    const ctx = <CanvasRenderingContext2D>canvas.value.getContext("2d")

    ctx.clearRect(0, 0, cw.value, ch.value)

    const img = ctx.createImageData(ch.value, cw.value)

    const visited: boolean[] = Array(cw.value * ch.value).fill(false)

    let numVisited = 0;

    function getPointData(x: number, y: number) {
      const start = ((y * cw.value) + x) * 4
      return <vec4>Array.from(img.data.slice(start, start + 4))
    }

    function setPointData(x: number, y: number, ...[r = 0, g = 0, b = 0, a = 0]: vec4) {
      const i = (((y * cw.value) + x) * 4)
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = a;
    }
    function clamp(val: number, min: number, max: number) {
      return (val > max) ? max : (val < min) ? min : val
    }
    function mutate(num: number, rand: number, min = -Infinity, max = Infinity) {
      return clamp(Math.round(num + ((Math.random() - 0.5) * rand * 2)), min, max)
    }
    function mutate4(vec: vec4) {
      return <vec4>structuredClone(vec).map((val) => mutate(val, mutateRate, 0, 255))
    }

    function isVisited([x, y]: vec2) {
      return visited[y * cw.value + x]
    }
    function setVisited(wasVisited: boolean, ...[x, y]: vec2) {
      visited[y * cw.value + x] = wasVisited;
    }

    function isValid([x, y]: vec2) {
      return x >= 0 && x < cw.value && y >= 0 && y < ch.value;
    }
    function getNeighbors([x, y]: vec2) {
      return (<vec2[]>[
        //diagonal
        [x + 1, y + 1],
        [x + 1, y - 1],
        [x - 1, y + 1],
        [x - 1, y - 1],
        //straight 
        [x - 1, y - 0],
        [x + 1, y - 0],
        [x - 0, y - 1],
        [x - 0, y + 1],
        //self

      ]).filter(isValid)
    }
    function vectorAvg(vec: vec4[]) {
      return <vec4>vec.slice(1)
        .reduce(([a1, a2, a3, a4], [b1, b2, b3, b4]) => [a1 + b1, a2 + b2, a3 + b3, a4 + b4], vec[0])
        .map(val => val / vec.length)
    }
    function shuffle(arr: any[]) {
      return arr.sort(() => Math.random() - 0.5)
    }
    function vecEquals(v1: vec2, v2: vec2) {
      return v1[0] == v2[0] && v2[0] == v2[1]
    }

    const que: vec2[] = [[0, 0]]
    setPointData(...[0, 1], 128, 0, 0, 255)
    setVisited(true, 0, 1)

    while (que.length) {
      const curr = <vec2>que.pop()
      if (!isVisited(curr)) {
        progress.value = ("visited: " +
          (numVisited / (cw.value * ch.value) * 100).toFixed(2) +
          "% que length: " +
          que.length);
        setVisited(true, ...curr);
        numVisited++;
        const neighbors = getNeighbors(curr)
        que.push(...shuffle(neighbors));
        const neighborPaints = neighbors
          .filter(isVisited)
          .map((n) => getPointData(...n))
        const avgPaint = vectorAvg(neighborPaints)
        const avgRed = avgPaint[0]
        setPointData(...curr, mutate(avgRed, 15, 0, 255), 0, 0, 255)
        ctx.putImageData(img, 0, 0)
        await new Promise(res => setTimeout(res, 0))
      }
    }
    ctx.putImageData(img, 0, 0)
  }
})


</script>

<template>
  <div class="main">
    <div class="canvasContainer">
      <canvas class="c" ref="canvas" :width="cw" :height="ch"></canvas>
      <div class="details">
        <h4>{{ progress }}</h4>

      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
.main {

  .canvasContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .details {
      width: fit-content;

    }
  }
}

canvas {
  border: 2px dashed black;
}
</style>
