import { createApp } from 'vue'
import { pinia } from './stores'
import App from './App.vue'
import './assets/styles/variables.css'
import './assets/styles/animations.css'
import './assets/styles/global.css'

const app = createApp(App)
app.use(pinia)
app.mount('#app')
