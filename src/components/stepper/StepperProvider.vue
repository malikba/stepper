<script setup lang="ts">
import { provide, inject } from 'vue';
import { useStepperMachine } from '../../composables/useStepperMachine';
import type { StepperOptions } from '../../interfaces/stepper';
import { StepperKey } from '../../symbols';

const props = defineProps<{
  stepperId: string;
  initialState?: StepperOptions['initialState'];
  globalConfig?: StepperOptions['globalConfig'];
}>();

const stepper = useStepperMachine({
  stepperId: props.stepperId,
  initialState: props.initialState,
  globalConfig: props.globalConfig,
});

provide(StepperKey, stepper);
</script>

<template>
  <div class="stepper-provider">
    <slot></slot>
  </div>
</template>

<style scoped>
.stepper-provider {
  display: contents;
}
</style> 