import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { updateStore } from './lib/stores/version.svelte'

// Initialize service worker for PWA updates
updateStore.init();

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
