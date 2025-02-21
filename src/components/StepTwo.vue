<script setup>
import { ref, onMounted } from 'vue';
import { useStepper } from '../composables/useStepper';

const { setStepData, registerStep, getStepData, validateStepData } = useStepper({ stepperId: 'myStepper' });

// Initialize stepData with existing data from the stepper or default values
const stepData = ref(getStepData() || { email: '' });

// Validation function
const validateStep = () => Object.values(stepData.value).every(value => value !== "");

// Watch for changes and update stepper data
const updateStepperData = () => {
  setStepData(stepData.value);
  validateStepData({ stepIndex: 1, validationCallback: validateStep });
};

// Handler for v-model updates
const handleUpdate = (newValue) => {
  stepData.value.email = newValue;
  updateStepperData();
};

onMounted(() => {
  registerStep({ 
    title: 'Step 2',
    isValid: validateStep(),
    confirmation: {
      next: {
        enabled: true,
        message: 'Please confirm your selections in Step 2 before proceeding.',
        header: 'Validate Step 2'
      },
      previous: {
        enabled: true,
        message: 'Going back will reset your Step 2 selections. Continue?',
        header: 'Reset Warning'
      }
    },
  });
  updateStepperData();
});
</script>

<template>
  <div>
    <h2>Step 2</h2>
    <input 
      v-model="stepData.email" 
      @update:model-value="handleUpdate"
      placeholder="Enter your email" 
    />
  </div>
</template>