<script setup lang="ts">

import { onMounted, ref } from 'vue';

const canvas = ref<HTMLCanvasElement>();


const cw = ref(500);
const ch = ref(500);

const pause = ref(false);

const otherCanvas =  new OffscreenCanvas(cw.value, ch.value);
const ctx2 = otherCanvas.getContext('2d');

//define shape here

ctx2.fillStyle = "black";
ctx2.fillRect(20,20, 20, 20);

ctx2.font = "160px Arial";
ctx2.fillText("hello", 50, 200);

// end define shape

const whereFill = ctx2.getImageData(0,0,ch.value,cw.value).data;

function checkFilled(x: number, y: number) {
  return whereFill[((y * ch.value + x) * 4)+3] !== 0;
}

const movingNoise = generateNoise(cw.value, ch.value, ()=>true);

function updateNoise() {
  const numPixels = cw.value * ch.value;
  for(let i=0; i < numPixels; i++) {
    if(i<numPixels-ch.value) {
      const brightness =  movingNoise.data[(i+ch.value) * 4 + 0];
    movingNoise.data[i * 4 + 0] = brightness;
    movingNoise.data[i * 4 + 1] = brightness;
    movingNoise.data[i * 4 + 2] = brightness;
    movingNoise.data[i * 4 + 3] = 255;
    }else {
      const brightness =  Math.floor(Math.random() * 256);
    movingNoise.data[i * 4 + 0] = brightness;
    movingNoise.data[i * 4 + 1] = brightness;
    movingNoise.data[i * 4 + 2] = brightness;
    movingNoise.data[i * 4 + 3] = 255;
    }
    
  }
}

// console.log(checkFilled(100, 100));
// console.log(checkFilled(50, 50));

const solidNoise = generateNoise(cw.value, ch.value, checkFilled);

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = cw.value;
    canvas.value.height = ch.value;
    const ctx = canvas.value.getContext('2d');
    if (ctx) {

    
     
      loop(ctx);
      
    }
  }
});

function generateNoise(width: number, height: number,fillFunction: (x: number, y: number) => boolean) {
  const d = new ImageData(width, height);

  for (let i = 0; i < width * height; i++) {
    const brightness =  Math.floor(Math.random() * 256);
    d.data[i * 4 + 0] = brightness;
    d.data[i * 4 + 1] = brightness;
    d.data[i * 4 + 2] = brightness;
    d.data[i * 4 + 3] = fillFunction(i % width, Math.floor(i / width)) ? 0 : 255;
  }
  return d;
}

function makeCombined(solid: ImageData, moving: ImageData,toFill:ImageData) {
  const combined = toFill;
  const numPixels = cw.value * ch.value;
  for(let i=0; i < numPixels; i++) {
    if(solid.data[i * 4 + 3] == 255) {
      combined.data[i * 4 + 0] = solid.data[i * 4 + 0];
      combined.data[i * 4 + 1] = solid.data[i * 4 + 1];
      combined.data[i * 4 + 2] = solid.data[i * 4 + 2];
    }
    else{
      combined.data[i * 4 + 0] = moving.data[i * 4 + 0];
      combined.data[i * 4 + 1] = moving.data[i * 4 + 1];
      combined.data[i * 4 + 2] = moving.data[i * 4 + 2];
    }
    combined.data[i * 4 + 3] = 255;
  }
  return combined;
}

const combinedID = new ImageData(cw.value, ch.value);

function loop(ctx: CanvasRenderingContext2D) {
  requestAnimationFrame(() => loop(ctx));
  if(pause.value) return;
  updateNoise();

  const combined = makeCombined(solidNoise, movingNoise,combinedID);
  console.log(combined.data)
  ctx.putImageData(combined, 0, 0); 

  // ctx.putImageData(solidNoise, 0, 0);
  // ctx.putImageData(movingNoise, 0, 0);

  

}


</script>

<template>
  <div class="container">
    <div class="btnContainer">
      <button v-on:click="pause = !pause">toggle pause</button>

    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    .btnContainer {
      
      button{
        margin: 10px;
      }
    }
 
    canvas {
      border: 1px solid black;
    }
  }
</style>
