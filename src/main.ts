import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// Import PrimeVue and the theme
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Stepper from './components/Stepper.vue';
import StepOne from './components/StepOne.vue';
import StepTwo from './components/StepTwo.vue';
import StepThree from './components/StepThree.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';
import StepperConfirmDialog from './components/StepperConfirmDialog.vue';

const app = createApp(App);

// Use PrimeVue with default configuration
app.use(PrimeVue, {
  theme: {
      preset: Aura
  }
});

app.use(ConfirmationService);

app.component('Stepper', Stepper);
app.component('StepOne', StepOne);
app.component('StepTwo', StepTwo);
app.component('StepThree', StepThree);
app.component('ConfirmDialog', ConfirmDialog);
app.component('StepperConfirmDialog', StepperConfirmDialog);

app.mount('#app');
