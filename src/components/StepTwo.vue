<script setup lang="ts">
import { useStepper } from '../composables/useStepper';
import StepWrapper from './StepWrapper.vue';

const validateStep = (data: { email: string }) => data.email !== "";

const stepConfig = {
  title: 'Step 2',
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
  }
};
</script>

<template>
  <StepWrapper
    stepper-id="myStepper"
    :validation="validateStep"
    :step-config="stepConfig"
    :initial-data="{ email: '' }"
    v-slot="{ data }"
  >
    <div>
      <h2>Step 2</h2>
      <input 
        v-model="data.email"
        placeholder="Enter your email" 
      />
    </div>
  </StepWrapper>
</template>