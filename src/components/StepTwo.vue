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
  registerStep({ title: 'Step 2', isValid: false });
  setStepData(stepData.value);
});
</script>

<template>
  <div>
    <h2>Step 2</h2>
    <input v-model="stepData.email" placeholder="Enter your email" />
  </div>
</template>