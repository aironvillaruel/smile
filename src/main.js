import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { library } from '@fortawesome/fontawesome-svg-core';
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice'  // Import ToastService

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowsToEye, faBan, faBars, faCamera, faCameraRetro, faCaretUp, faCircleHalfStroke, faCircleXmark, faDatabase, faDroplet, faEnvelope, faFilm, faFire, faHouse, faLeaf, faLightbulb, faPaperPlane, faPassport, faPhone, faSnowflake, faSun, faUser } from '@fortawesome/free-solid-svg-icons';
import { faLaravel, faVuejs, faReact, faHtml5, faCss3Alt, faJs, faPhp, faFacebookSquare, faInstagramSquare, faGithubSquare, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import {  faMoon } from '@fortawesome/free-regular-svg-icons';

// Add icons to library
library.add(faHouse, faLightbulb, faCaretUp, faLaravel, faFacebookSquare, faVuejs, faReact, faHtml5, faCss3Alt, faJs, faPhp, faDatabase, faBars, faPassport, faPhone, faMoon, faUser, faEnvelope, faInstagramSquare, faGithubSquare, faLinkedin, faPaperPlane, faCamera, faCircleXmark,faCircleHalfStroke,faCameraRetro,faBan,faDroplet,faSun,faFilm,faArrowsToEye,faLeaf,faSnowflake,faFire);

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(router);
app.use(PrimeVue);  // Use PrimeVue
app.use(ToastService);  // Use ToastService for notifications

app.mount('#app');
