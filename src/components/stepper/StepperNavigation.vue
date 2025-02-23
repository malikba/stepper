<script setup lang="ts">
import { inject, computed } from 'vue';
import { StepperKey } from '../../symbols/stepper';

const stepper = inject(StepperKey);

if (!stepper) {
  throw new Error('StepperNavigation must be used within StepperProvider');
}

const canGoNext = computed(() => {
  return stepper.isStepValid.value && !stepper.isLastStep.value;
});

const canGoPrevious = computed(() => {
  return !stepper.isFirstStep.value;
});

defineEmits<{
  (e: 'complete'): void;
}>();
</script>

<template>
  <div class="stepper-navigation">
    <button
      class="btn btn-secondary"
      :disabled="!canGoPrevious"
      @click="stepper.goToPreviousStep()"
    >
      Previous
    </button>
    <button
      v-if="!stepper.isLastStep.value"
      class="btn btn-primary"
      :disabled="!canGoNext"
      @click="stepper.goToNextStep()"
    >
      Next
    </button>
    <button
      v-else
      class="btn btn-success"
      :disabled="!stepper.isStepValid.value"
      @click="$emit('complete')"
    >
      Complete
    </button>
  </div>
</template>

<style scoped>
.stepper-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-card);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color);
  color: var(--primary-color-text);
}

.btn-primary:not(:disabled):hover {
  background: var(--primary-600);
}

.btn-secondary {
  background: var(--surface-ground);
  color: var(--text-color);
}

.btn-secondary:not(:disabled):hover {
  background: var(--surface-hover);
}

.btn-success {
  background: var(--green-500);
  color: var(--surface-0);
}

.btn-success:not(:disabled):hover {
  background: var(--green-600);
}
</style> 