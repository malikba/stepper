<script setup>
import { ref, watch, onBeforeMount } from 'vue';
import { useStepper } from '../composables/useStepper';

const { setStepData, registerStep, getStepData, validateStepData } = useStepper({ stepperId: 'myStepper' });
const stepData = ref({ email: '' });

watch(stepData, (newData) => {
  setStepData(newData);
  validateStepData({stepIndex: 1, validationCallback: () => Object.values(getStepData()).every(value => value !== "")});
}, { deep: true });

onBeforeMount(() => {
  registerStep({ 
    title: 'Step 2',
    isValid: false,
    componentName: 'StepTwo',
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
  setStepData(stepData.value);
});
</script>

<template>
  <div>
    <h2>Step 2</h2>
    <input v-model="stepData.email" placeholder="Enter your email" />
  </div>
</template>