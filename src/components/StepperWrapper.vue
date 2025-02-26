<script setup lang="ts">
import { computed } from 'vue';
import { useStepper } from '../composables/useStepper';
import Button from 'primevue/button';

interface Flow {
  [key: string]: string[];
}

interface Props {
  stepperId: string;
  flows: Flow;
  initialFlowKey: string;
  initialState?: {
    currentStepIndex: number;
    data: Record<string, any>[];
  };
}

const props = withDefaults(defineProps<Props>(), {
  initialState: () => ({
    currentStepIndex: 0,
    data: [],
  })
});

const {
  state,
  currentFlow,
  currentStepComponent,
  isFirstStep,
  isLastStep,
  isStepValid,
  goToNextStep,
  goToPreviousStep,
  setFlows,
  setCurrentFlow,
} = useStepper({
  stepperId: props.stepperId,
  initialState: {
    currentStepIndex: props.initialState.currentStepIndex,
    currentFlowKey: props.initialFlowKey,
    flows: props.flows,
    steps: [],
    data: props.initialState.data,
  },
});

// Expose key methods and state to parent
defineExpose({
  state,
  currentFlow,
  setCurrentFlow,
});

const onSubmit = () => {
  const formData = state.value.data.reduce((acc, stepData) => {
    return { ...acc, ...stepData };
  }, {});
  
  emit('submit', formData);
};

const emit = defineEmits<{
  (e: 'submit', data: Record<string, any>): void;
  (e: 'next'): void;
  (e: 'previous'): void;
}>();
</script>

<template>
  <section>
    <!-- Header slot -->
    <slot 
      name="header" 
      :current-flow="currentFlow"
      :current-step="currentStepComponent"
      :state="state"
    />

    <!-- Steps slot -->
    <slot 
      name="steps" 
      :current-flow="currentFlow"
      :current-step="currentStepComponent"
    >
      <div>
        <template v-for="stepComponent of currentFlow" :key="stepComponent">
          <component :is="stepComponent" v-show="stepComponent === currentStepComponent"/>
        </template>
      </div>
    </slot>

    <!-- Navigation slot -->
    <slot
      name="navigation"
      :go-next="goToNextStep"
      :go-previous="goToPreviousStep"
      :is-first="isFirstStep"
      :is-last="isLastStep"
      :is-valid="isStepValid"
      :on-submit="onSubmit"
    >
      <div class="flex justify-content-between mt-3">
        <Button 
          @click="goToPreviousStep" 
          v-if="!isFirstStep"
          label="Previous"
          severity="secondary"
        />
        <Button 
          @click="goToNextStep"
          v-if="!isLastStep"
          :disabled="!isStepValid"
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
    </slot>

    <!-- Footer slot -->
    <slot 
      name="footer"
      :current-flow="currentFlow"
      :current-step="currentStepComponent"
      :state="state"
    />
  </section>
</template>

<style scoped>
.flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.mt-3 {
  margin-top: 1rem;
}
</style> 