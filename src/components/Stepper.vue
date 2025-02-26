<script setup lang="ts">
import StepperWrapper from './StepperWrapper.vue';
import StepperConfirmDialog from './StepperConfirmDialog.vue';
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

const onSubmit = (formData: Record<string, any>) => {
  console.log('Form submitted:', formData);
};
</script>

<template>
  <section>
    <StepperConfirmDialog position="top" />

    <StepperWrapper
      stepper-id="myStepper"
      :flows="flows"
      :initial-flow-key="Flows.FLOW1"
      @submit="onSubmit"
    >
      <template #header="{ currentFlow, state }">
        <pre>selected flow: {{ JSON.stringify(currentFlow, null, 2) }}</pre>
        <pre>{{ JSON.stringify(state.data, null, 2) }}</pre>
      </template>
    </StepperWrapper>
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