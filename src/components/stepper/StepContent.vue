<script setup lang="ts">
import { inject, computed } from 'vue';
import { StepperKey } from '../../symbols/stepper';

const stepper = inject(StepperKey);

if (!stepper) {
  throw new Error('StepContent must be used within StepperProvider');
}

const currentStepIndex = computed(() => stepper.currentStepIndex.value);
const allComponents = computed(() => stepper.currentFlow.value || []);

const getStepData = (index: number) => {
  return stepper.getStepData(index);
};

const handleStepDataUpdate = (data: any, index: number) => {
  stepper.setStepData(data);
};
</script>

<template>
  <div class="step-content">
    <template v-for="(component, index) in allComponents" :key="index">
      <component
        :is="component"
      v-show="index === currentStepIndex"
      @update:step-data="(data) => handleStepDataUpdate(data, index)"
    />
  </template>
  </div>
</template>

<style scoped>
.step-content {
  background: var(--surface-card);
  border-radius: 8px;
  padding: 1.5rem;
  min-height: 200px;
  box-shadow: var(--card-shadow);
}
</style> 