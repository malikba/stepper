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

// Initial steps metadata with confirmation settings
const initialSteps = [
  {
    title: 'Step 1',
    isValid: false,
    componentName: 'StepOne',
    confirmation: {
      next: {
        enabled: true,
        message: 'Have you filled all the required fields in Step 1?',
        header: 'Validate Step 1'
      }
    }
  },
  {
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
    }
  },
  {
    title: 'Step 3',
    isValid: false,
    componentName: 'StepThree'
  }
];

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
      steps: initialSteps,
      data: [],
    },
    stepperId: 'myStepper',
    globalConfig: {
      confirmation: {
        next: {
          enabled: true,
          message: 'Are you ready to proceed to the next step?',
          header: 'Next Step'
        },
        previous: {
          enabled: true,
          message: 'Going back will lose your changes. Continue?',
          header: 'Previous Step'
        }
      }
    }
  });

const onSubmit = () => {
  // Handle form submission
  console.log('Form submitted:', state.data);
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