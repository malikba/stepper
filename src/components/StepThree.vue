<script setup>
import { ref, onMounted } from 'vue';
import { useStepper } from '../composables/useStepper';

const { setStepData, registerStep, getStepData, validateStepData } = useStepper({ stepperId: 'myStepper' });

// Initialize stepData with existing data from the stepper or default values
const stepData = ref(getStepData() || { age: '' });

// Validation function
const validateStep = () => Object.values(stepData.value).every(value => value !== "");

// Watch for changes and update stepper data
const updateStepperData = () => {
  setStepData(stepData.value);
  validateStepData({ stepIndex: 2, validationCallback: validateStep });
};

// Handler for v-model updates
const handleUpdate = (newValue) => {
  stepData.value.age = newValue;
  updateStepperData();
};

onMounted(() => {
  registerStep({ 
    title: 'Step 3', 
    isValid: validateStep(),
    confirmation: {
      previous: {
        enabled: true,
        message: 'Going back will reset your Step 3 selections. Continue?',
        header: 'Reset Warning'
      }
    },
  });
  updateStepperData();
});
</script>

<template>
  <div>
    <h2>Step 3</h2>
    <input 
      v-model="stepData.age" 
      @update:model-value="handleUpdate"
      placeholder="Enter your age" 
    />
  </div>
</template>
