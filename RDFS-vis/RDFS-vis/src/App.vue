<script setup lang="ts">
import { ref, onMounted } from "vue"

type vec2 = [number, number]
type vec4 = [number, number, number, number]


const canvas = ref<HTMLCanvasElement | null>(null)
const mounted = ref(false)
const progress = ref("")

const settingsDisabled = ref(false);

const downloadBlob = ref<string|null>(null)

const abortRender = ref(false)

const cw = ref(100);
const ch = ref(100);

const mutateRate = ref(5)

function getPointData(img: ImageData, [x, y]: vec2) {
  const start = ((y * cw.value) + x) * 4
  return <vec4>Array.from(img.data.slice(start, start + 4))
}

function setPointData(img: ImageData, [x, y]: vec2, ...[r = 0, g = 0, b = 0, a = 0]: vec4) {
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
  return clamp(num + Math.floor((Math.random() - 0.5) * rand * 2), min, max)
}
function mutate4(vec: vec4) {
  return <vec4>structuredClone(vec).map((val) => mutate(val, mutateRate.value, 0, 255))
}

function isVisited([x, y]: vec2, visited: boolean[]) {
  return visited[y * cw.value + x]
}
function setVisited([x, y]: vec2, visited: boolean[], wasVisited: boolean) {
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

function startRender(){
  settingsDisabled.value = true;
}

function cancelRender(){
  settingsDisabled.value = false;
  abortRender.value = true
}



function finishRender(data:ImageData){
  settingsDisabled.value = false;

  getCtx().putImageData(data,0,0);

  downloadBlob.value = canvas.value?.toDataURL() ?? err("non-existent canvas")
}

async function drawRender(ctx: CanvasRenderingContext2D) {


  

  startRender()
  let numVisited = 0

  const progressMult = 1/((cw.value * ch.value) / 100) 

  //set up required utility objects
  const visited: boolean[] = Array(cw.value * ch.value).fill(false)
  const img = ctx.createImageData(ch.value, cw.value)

  //setup que and start point
  const que: vec2[] = [[0, 0]]
  setPointData(img, [0, 1], 128, 0, 0, 255)
  setVisited([0, 1], visited, true)


  //clear canvas
  ctx.clearRect(0, 0, cw.value, ch.value);

  const update = ()=> progress.value = ("visited: " +
        (numVisited * progressMult).toFixed(2) +
        "% que length: " +
        que.length);

  //iterate through que
  while (que.length) {
    if(abortRender.value){ abortRender.value = false; break}
    const curr = <vec2>que.pop()
    if (!isVisited(curr, visited)) {
      update()
      setVisited(curr, visited, true);
      numVisited++;
      const neighbors = getNeighbors(curr)
      que.push(...shuffle(neighbors));
      const neighborPaints = neighbors
        .filter(val => isVisited(val, visited))
        .map(n => getPointData(img, n))
      const avgPaint = vectorAvg(neighborPaints)
      const avgRed = avgPaint[0]
      setPointData(img, curr, mutate(avgRed, 15, 0, 255), 0, 0, 255)
      ctx.putImageData(img, 0, 0)
      await new Promise(res => setTimeout(res, 0))
    }
  }
  update()
  finishRender(img)
}

function err(msg:string){
  return <never> console.error("error: "+msg)
}

function getCtx(){
  return canvas.value?.getContext("2d") ?? err("missing canvas")
}

onMounted(async () => {
  console.log(canvas.value)

  if (canvas.value) {
    const ctx = <CanvasRenderingContext2D>canvas.value.getContext("2d")


  }
})


</script>

<template>
  <div class="main">
    <div class="inputs">

      <div class="input">
        <label for="canvasHeight">Canvas Height</label>
        <input type="number" name="canvasHeight" v-model="ch" min="1" max="2000" :disabled="settingsDisabled">
      </div>

      <div class="input">
        <label for="canvasWidth">Canvas Width</label>
        <input type="number" name="canvasWidth" v-model="cw" min="1" max="2000" :disabled="settingsDisabled">
      </div>

      <div class="input">
        <label for="mutateRate">MutateRate</label>
        <input type="number" name="mutateRate" v-model="mutateRate" min="0" max="255" :disabled="settingsDisabled">
      </div>

      <button v-if="!settingsDisabled" @click="() => drawRender(getCtx())" :disabled="mounted">Start
        Render</button>
      <button v-else @click="() => cancelRender()">Cancel Render</button>
    </div>
    <div class="canvasContainer">
      <canvas class="c" ref="canvas" :width=" cw " :height=" ch "></canvas>
      <div class="details">
        <h4>{{ progress }}</h4>
        <a :hidden="downloadBlob===null" :href="downloadBlob ?? ''" target="_blank" download="RDFS_art.png" >
          <button>Download</button>
        </a>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
.main {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

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
