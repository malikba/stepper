<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import { StepperProvider, Stepper } from './components/stepper';
import PersonalInfoStep from './components/steps/PersonalInfoStep.vue';
import AddressStep from './components/steps/AddressStep.vue';
import ConfirmationDialog from './components/confirmation/ConfirmationDialog.vue';
import { DefaultConfirmationService } from './services/ConfirmationService';
import { ConfirmationServiceKey } from './symbols/confirmation';

const confirmationDialog = ref<InstanceType<typeof ConfirmationDialog> | null>(null);
const confirmationService = new DefaultConfirmationService();

provide(ConfirmationServiceKey, confirmationService);

onMounted(() => {
  if (confirmationDialog.value) {
    confirmationService.setDialog(confirmationDialog.value);
  }
});

const initialState = {
  currentStepIndex: 0,
  currentFlowKey: 'registration',
  steps: [],
  data: [],
  flows: {
    registration: ['PersonalInfoStep', 'AddressStep']
  }
};

const config = {
  confirmation: {
    previous: {
      enabled: true,
      message: 'Going back will reset the current step data. Are you sure?',
      header: 'Confirm Navigation'
    }
  }
};

const handleComplete = () => {
  console.log('Form completed!');
  // Handle form completion here
};
</script>

<template>
  <div class="app">
    <StepperProvider
      stepper-id="registration-form"
      :initial-state="initialState"
      :global-config="config"
    >
      <Stepper
        show-progress
        show-navigation
        @complete="handleComplete"
      />
    </StepperProvider>
    <ConfirmationDialog ref="confirmationDialog" />
  </div>
</template>

<style>
.app {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

:root {
  --primary-color: #3B82F6;
  --primary-600: #2563EB;
  --primary-color-text: #FFFFFF;
  --surface-ground: #F8FAFC;
  --surface-card: #FFFFFF;
  --surface-border: #E2E8F0;
  --surface-hover: #F1F5F9;
  --text-color: #334155;
  --text-color-secondary: #64748B;
  --card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --green-500: #22C55E;
  --green-600: #16A34A;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: var(--surface-ground);
  color: var(--text-color);
  margin: 0;
  padding: 0;
}
</style>
