<script setup>
import { ref, watch, onMounted } from 'vue';
import { useStepper } from '../composables/useStepper';

const { setStepData, registerStep, getStepData } = useStepper({ stepperId: 'myStepper' });
const stepData = ref({ email: '' });

watch(stepData, (newData) => {
  setStepData(newData);
}, { deep: true });

onMounted(() => {
  registerStep({ title: 'Step 2', isValid: false });
  stepData.value = getStepData();
});
</script>

<template>
  <div>
    <h2>Step 2</h2>
    <input v-model="stepData.email" placeholder="Enter your email" />
  </div>
</template>