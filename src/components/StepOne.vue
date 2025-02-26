<script setup lang="ts">
import { useStepper } from '../composables/useStepper';
import StepWrapper from './StepWrapper.vue';

const { setCurrentFlow } = useStepper({ stepperId: 'myStepper' });

const validateStep = (data: { name: string }) => data.name === "malik";

const stepConfig = {
  title: 'Step 1',
  confirmation: {
    next: {
      enabled: true,
      message: 'Have you filled all the required fields in Step 1?',
      header: 'Validate Step 1'
    }
  }
};
</script>

<template>
  <StepWrapper
    stepper-id="myStepper"
    :validation="validateStep"
    :step-config="stepConfig"
    :initial-data="{ name: '' }"
    v-slot="{ data }"
  >
    <div>
      <h2>Step 1</h2>
      <p>Specific validation for step - write "malik" in the input</p>
      <input 
        v-model="data.name"
        placeholder="Enter your name" 
      /><br>
      <section class="flow-buttons">
        <div class="flow-button" @click="setCurrentFlow('flow1')">select flow 1</div><br>
        <div class="flow-button" @click="setCurrentFlow('flow2')">select flow 2</div><br>
        <div class="flow-button" @click="setCurrentFlow('flow3')">select flow 3</div><br>
      </section>
    </div>
  </StepWrapper>
</template>

<style scoped>
.flow-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin: 20px 0;
  justify-content: center;
}

.flow-button {
  cursor: pointer;
  border: 1px solid #ccc;
  aspect-ratio: 1/1;
  padding: 10px;
  border-radius: 5px;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>