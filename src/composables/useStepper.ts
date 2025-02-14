import { computed, onBeforeMount, readonly, ComponentInstance } from 'vue';
import { useLocalStorage } from '@vueuse/core';

interface StepperOptions {
  initialState?: StepperState;
  stepperId: string;
}

interface StepMetadata {
  title: string;
  isValid: boolean;
}
// component: ComponentInstance<any>;

interface StepData {
  [key: string]: any;
}

interface StepperState {
  currentStepIndex: number;
  steps: StepMetadata[];
  data: StepData[];
  flows: { [key: string]: ComponentInstance<any>[] };
  currentFlowKey: string | null;
}

// TODO - handle modal config

export function useStepper({ initialState, stepperId }: StepperOptions) {

  // Merged state object containing both steps metadata and state data
  const state = useLocalStorage<StepperState>(`stepper_state_${stepperId}`, {
      currentStepIndex: initialState?.currentStepIndex ?? 0,
      currentFlowKey: initialState?.currentFlowKey ?? null,
      steps: initialState?.steps ?? [],
      data: initialState?.data ?? [],
      flows: initialState?.flows ?? {},
  }, {
    mergeDefaults: true
  });

  // Getter for currentStep
  const getCurrentStepIndex = computed(() => state.value.currentStepIndex);

  // Setter for currentStep
  const setCurrentStepIndex = (step: number) => {
      if (step >= 0 && step < state.value.steps.length) {
          state.value.currentStepIndex = step;
      }
  };

  const setStepData = (data: Record<string, any>) => {
      state.value.data[state.value.currentStepIndex] = {...state.value.data[state.value.currentStepIndex], ...data};
  };

  const getStepState = (stepIndex?: number) => {
      return state.value.data[stepIndex ?? state.value.currentStepIndex];
  };

  const getStepData = (stepIndex?: number) => {
      return state.value.data[stepIndex ?? state.value.currentStepIndex];
  };

  const getStepMetadata = (stepIndex?: number) => {
      return state.value.steps[stepIndex ?? state.value.currentStepIndex];
  };

  const goToNextStep = () => {
      if (!state.value.currentFlowKey) {
        return;
      }

      if (state.value.currentStepIndex < state.value.flows[state.value.currentFlowKey].length - 1) {
          state.value.currentStepIndex++;
      }

  };

  const goToPreviousStep = () => {
      if (state.value.currentStepIndex > 0) {
          state.value.currentStepIndex--;
      }
  };

  // Method to validate step data
  const isStepDataValid = (stepIndex: number, validationCallback?: () => boolean) => {
      if (validationCallback) {
        state.value.steps[stepIndex].isValid = validationCallback();
        return validationCallback();
      }

      state.value.steps[stepIndex].isValid = state.value.data[stepIndex] !== undefined && state.value.data[stepIndex] !== null;
      return state.value.steps[stepIndex].isValid;
  };

  // Method for a step to register itself
  const registerStep = (metadata: StepMetadata, stepIndex?: number, ) => {
      if (stepIndex !== undefined && stepIndex >= 0 && stepIndex < state.value.steps.length) {
          state.value.steps[stepIndex] = metadata;
      } else {
        state.value.steps[state.value.currentStepIndex] = metadata;
      }
  };

  const isLastStep = computed(() => {
      return state.value.currentStepIndex === state.value.steps.length - 1;
  });

  const isFirstStep = computed(() => {
      return state.value.currentStepIndex === 0;
  });

  // New method to set flows
  const setFlows = (newFlows: { [key: string]: ComponentInstance<any>[] }) => {
      state.value.flows = newFlows;
  };

  // New method to get flows
  const getFlows = () => {
      return state.value.flows;
  };

  const currentFlow = computed(() => {
    if (!state.value.currentFlowKey || !(state.value.flows instanceof Object)) {
      throw new Error('No default flow defined');
    }

    return state.value.flows[state.value.currentFlowKey];
  });

  const getCurrentFlowKey = () => {
    return state.value.currentFlowKey;
  };

  const currentStepComponent = computed(() => {
    if (!state.value.currentFlowKey) {
      return null;
    }

    return currentFlow.value?.[state.value.currentStepIndex];
  });

  // Set the current flow from the flow key defined in the stepper component
  const setCurrentFlow = (flowKey: string) => {
      if (state.value.flows.hasOwnProperty(flowKey)) {
          state.value.currentFlowKey = flowKey;
          // Reset the current step index when changing flows
          state.value.currentStepIndex = 0;
          // Reset the data for the new flow
          state.value.data = [];
      } else {
          console.warn(`Flow with key "${flowKey}" does not exist.`);
      }
  };

  const allStepsBeforeAreValid = (index: number): boolean => {
    return !Array.from({ length: index }, () => null)
      .some((_, i) => !state.value.steps.at(i)?.isValid)
  }

  onBeforeMount(() => {
    state.value.currentStepIndex = state.value.currentStepIndex;
  });

  return {
      // State (read only)
      currentStep: getCurrentStepIndex,
      state: readonly(state),

      // Setters
      setCurrentStepIndex,
      goToNextStep,
      goToPreviousStep,
      setStepData,
      registerStep,
      setFlows,
      setCurrentFlow,
      
      // Getters
      currentStepMetadata: getStepMetadata,
      currentStepState: getStepState,
      getStepData,
      getStepMetadata,
      getStepState,
      getFlows,
      getCurrentFlowKey,

      // Derived state
      currentStepComponent,
      currentFlow,

      // Validators
      isStepDataValid,
      isLastStep,
      isFirstStep,

      // Methods
      allStepsBeforeAreValid,

  };
}

