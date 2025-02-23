<script setup lang="ts">
import { inject } from 'vue';
import { StepperKey } from '../../symbols/stepper';
import StepperProgress from './StepperProgress.vue';
import StepperNavigation from './StepperNavigation.vue';
import StepContent from './StepContent.vue';

const stepper = inject(StepperKey);

if (!stepper) {
  throw new Error('Stepper must be used within StepperProvider');
}

defineProps<{
  showProgress?: boolean;
  showNavigation?: boolean;
}>();
</script>

<template>
  <div class="stepper">
    <StepperProgress v-if="showProgress" />
    <StepContent />
    <StepperNavigation v-if="showNavigation" />
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}
</style> 