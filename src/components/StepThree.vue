<script setup>
import { ref, watch, onBeforeMount } from 'vue';
import { useStepper } from '../composables/useStepper';

const { setStepData, registerStep, getStepData, validateStepData } = useStepper({ stepperId: 'myStepper' });
const stepData = ref({ age: '' });

watch(stepData, (newData) => {
  setStepData(newData);

  validateStepData({stepIndex: 2, validationCallback: () => Object.values(getStepData()).every(value => value !== "")});
}, { deep: true });

onBeforeMount(() => {
  registerStep({ title: 'Step 3', isValid: false });
  setStepData(stepData.value);
});
</script>

<template>
  <div>
    <h2>Step 3</h2>
    <input v-model="stepData.age" placeholder="Enter your age" />
  </div>
</template>
