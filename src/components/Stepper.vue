<script setup lang="ts">
import { Button } from 'primevue/button';
import { computed, watch, defineComponent } from 'vue';
import { useStepper } from '../composables/useStepper';
import StepOne from './StepOne.vue';
import StepTwo from './StepTwo.vue';
import StepThree from './StepThree.vue';

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
  isFirstStep, state } = useStepper({
    initialState: {
      currentStepIndex: 0,
      currentFlowKey: Flows.FLOW1,
      flows,
      steps: [],
      data: [],
    },
    stepperId: 'myStepper',
  });
</script>

<template>
  <section>
    <pre>selected flow: {{ JSON.stringify(currentFlow, null, 2) }}</pre>
    <pre>{{ JSON.stringify(state.data, null, 2) }}</pre>
    <div>
      <component :is="currentStepComponent" />
    </div>
    <div>
      <button @click="goToPreviousStep" :disabled="isFirstStep">Previous</button>
      <button @click="goToNextStep" :disabled="isLastStep || !isStepValid">Next</button>
      <button @click="onSubmit" :disabled="!isLastStep || !isStepValid">Submit</button>
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