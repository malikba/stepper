<script setup lang="ts">
import { inject, computed } from 'vue';
import { StepperKey } from '../../symbols/stepper';

const stepper = inject(StepperKey);

if (!stepper) {
  throw new Error('StepperProgress must be used within StepperProvider');
}

const steps = computed(() => {
  if (!stepper.currentFlow.value) return [];
  return stepper.currentFlow.value.map((_, index) => ({
    title: stepper.getStepMetadata(index)?.title || `Step ${index + 1}`,
    isValid: stepper.getStepMetadata(index)?.isValid || false,
    isCurrent: index === stepper.currentStepIndex.value,
    isCompleted: index < stepper.currentStepIndex.value && stepper.getStepMetadata(index)?.isValid,
    isClickable: stepper.allStepsBeforeAreValid(index)
  }));
});

const handleStepClick = (index: number) => {
  if (steps.value[index].isClickable) {
    stepper.setCurrentStepIndex(index);
  }
};
</script>

<template>
  <div class="stepper-progress">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step"
      :class="{
        'is-current': step.isCurrent,
        'is-completed': step.isCompleted,
        'is-clickable': step.isClickable
      }"
      @click="handleStepClick(index)"
    >
      <div class="step-indicator">
        <span class="step-number">{{ index + 1 }}</span>
        <span v-if="step.isCompleted" class="step-check">✓</span>
      </div>
      <span class="step-title">{{ step.title }}</span>
    </div>
  </div>
</template>

<style scoped>
.stepper-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: var(--surface-card);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  column-gap: 100px;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  padding: 0.5rem;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -100px;
  top: 50%;
  width: 100px;
  height: 2px;
  background: var(--surface-border);
  transform: translateY(-50%);
  z-index: 0;
}

.step.is-completed:not(:last-child)::after {
  background: var(--primary-color);
}

.step-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--surface-ground);
  border: 2px solid var(--surface-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.step.is-current .step-indicator {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--primary-color-text);
}

.step.is-completed .step-indicator {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--primary-color-text);
}

.step-title {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.step.is-current .step-title {
  color: var(--text-color);
  font-weight: 600;
}

.step.is-clickable {
  cursor: pointer;
}

.step.is-clickable:hover .step-indicator {
  border-color: var(--primary-color);
}
</style> 