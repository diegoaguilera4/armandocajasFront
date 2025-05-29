import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import axios from 'axios'
import { router } from "./routes/routes.js"; 
import Notifications from '@kyvg/vue3-notification'
loadFonts()

if(process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = process.env.VUE_APP_API_LOCAL_URL;
}
else {
  axios.defaults.baseURL = process.env.VUE_APP_API_URL;
}



createApp(App)
  .use(router)
  .use(vuetify)
  .use(Notifications)
  .mount('#app')
