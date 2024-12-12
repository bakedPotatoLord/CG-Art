import { createApp } from 'vue'
import './style.css'
import App from './App.vue'


import { createMemoryHistory, createRouter } from 'vue-router'

import index from './pages/index.vue'
import Pulfrich from './pages/pulfritch.vue'
import RDFS from './pages/RDFS.vue'

const routes = [
  { path: '/', component: index },
  { path: '/pulfritch', component: Pulfrich },
  { path: '/RDFS', component: RDFS },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

createApp(App)
.use(router)
.mount('#app')
