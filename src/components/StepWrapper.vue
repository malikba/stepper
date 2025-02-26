<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useStepper } from '../composables/useStepper';

const props = defineProps<{
  initialData?: Record<string, any>;
  validation?: (data: Record<string, any>) => boolean;
  stepperId: string;
  stepConfig: {
    title: string;
    confirmation?: {
      next?: {
        enabled?: boolean;
        message?: string;
        header?: string;
      };
      previous?: {
        enabled?: boolean;
        message?: string;
        header?: string;
      };
    };
  };
}>();

const { setStepData, registerStep, getStepData, validateStepData } = useStepper({ 
  stepperId: props.stepperId 
});

// Initialize stepData with existing data from the stepper or default values
const stepData = ref<Record<string, any>>(getStepData() || props.initialData || {});

// Emit updated data to parent component
const emit = defineEmits<{
  (e: 'update:data', value: Record<string, any>): void;
}>();

// Validation function
const validateStep = () => {
  if (props.validation) {
    return props.validation(stepData.value);
  }
  return true;
};

// Watch for changes and update stepper data
const updateStepperData = () => {
  setStepData(stepData.value);
  validateStepData({ validationCallback: validateStep });
  emit('update:data', stepData.value);
};

// Watch for changes in stepData
watch(
  () => stepData.value,
  () => {
    console.log('stepData changed', stepData.value);
    updateStepperData();
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  registerStep({
    title: props.stepConfig.title,
    isValid: validateStep(),
    confirmation: props.stepConfig.confirmation,
  });
  updateStepperData();
});

// Expose stepData to slot
defineExpose({
  stepData,
});
</script>

<template>
  <div>
    <slot :data="stepData" />
  </div>
</template> 