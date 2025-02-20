<script setup lang="ts">
import Button from 'primevue/button';
import { computed, watch, defineComponent } from 'vue';
import { useStepper } from '../composables/useStepper';
import StepOne from './StepOne.vue';
import StepTwo from './StepTwo.vue';
import StepThree from './StepThree.vue';
import StepperConfirmDialog from './StepperConfirmDialog.vue';

enum Flows {
  FLOW1 = 'flow1',
  FLOW2 = 'flow2',
  FLOW3 = 'flow3',
}

const flows = {
  [Flows.FLOW1]: ["StepOne", "StepTwo", "StepThree"],
  [Flows.FLOW2]: ["StepOne", "StepThree"],
  [Flows.FLOW3]: ["StepOne", "StepTwo"]
};

const { setFlows,
  getStepData,
  isStepValid,
  currentStepComponent,
  currentFlow,
  goToNextStep,
  goToPreviousStep,
  isLastStep,
  isFirstStep,
  state,
  getCurrentStepConfig } = useStepper({
    initialState: {
      currentStepIndex: 0,
      currentFlowKey: Flows.FLOW1,
      flows,
      steps: [],
      data: [],
    },
    stepperId: 'myStepper',
  });

const onSubmit = () => {
  // Combine all step data into a single object (should it be a method inside useStepper?)
  const formData = state.value.data.reduce((acc, stepData) => {
    return { ...acc, ...stepData };
  }, {});
  
  console.log('Form submitted:', formData);
};
</script>

<template>
  <section>
    <StepperConfirmDialog position="top" />

    <pre>selected flow: {{ JSON.stringify(currentFlow, null, 2) }}</pre>
    <pre>{{ JSON.stringify(state.data, null, 2) }}</pre>
    <div>
      <component :is="currentStepComponent" />
    </div>
    <div class="flex justify-content-between mt-3">
      <Button 
        @click="goToPreviousStep" 
        :disabled="isFirstStep"
        label="Previous"
        severity="secondary"
      />
      <Button 
        @click="goToNextStep"
        v-if="!isLastStep"
        :disabled="isLastStep || !isStepValid"
        label="Next"
        severity="secondary"
        outlined
      />
      <Button 
        @click="onSubmit" 
        :disabled="!isLastStep || !isStepValid"
        severity="success"
        label="Submit"
        outlined
      />
      
    </div>
  </section>
</template>

<style scoped>
pre {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
}
</style>