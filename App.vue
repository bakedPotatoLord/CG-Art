<script setup lang="ts">
import { NuxtPage } from '#build/components';
import { RouterView } from 'vue-router';
</script>

<template>
  <div>
    <h1>CG Art</h1>
    <p>go to <NuxtLink to="/pulfritch">/pulfritch</NuxtLink></p>
    <p>go to <NuxtLink to="/RDFS">/RDFS</NuxtLink></p>
    <p>go <NuxtLink to="/">home</NuxtLink></p>
    <hr>
    <div class="router">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss">

body { 

  background-color: #242424;
  color:antiquewhite;
  text-align: center;
}


</style>
