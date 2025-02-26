<script setup lang="ts">
import { useStepper } from '../composables/useStepper';
import StepWrapper from './StepWrapper.vue';

const validateStep = (data: { age: string }) => data.age !== "";

const stepConfig = {
  title: 'Step 3',
  confirmation: {
    previous: {
      enabled: true,
      message: 'Going back will reset your Step 3 selections. Continue?',
      header: 'Reset Warning'
    }
  }
};
</script>

<template>
  <StepWrapper
    stepper-id="myStepper"
    :validation="validateStep"
    :step-config="stepConfig"
    :initial-data="{ age: '' }"
    v-slot="{ data }"
  >
    <div>
      <h2>Step 3</h2>
      <input 
        v-model="data.age"
        placeholder="Enter your age" 
      />
    </div>
  </StepWrapper>
</template>
