import { computed, readonly, ComponentInstance, inject } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { ConfirmationServiceKey } from '../symbols';

interface StepperOptions {
  initialState?: StepperState;
  stepperId: string;
  globalConfig?: GlobalConfig;
}

interface ConfirmDialogOptions {
  enabled: boolean;
  message?: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
}

interface GlobalConfig {
  confirmation?: {
    next?: Partial<ConfirmDialogOptions>;
    previous?: Partial<ConfirmDialogOptions>;
  };
}

interface StepMetadata {
  title: string;
  isValid: boolean;
  componentName?: string;
  confirmation?: {
    next?: Partial<ConfirmDialogOptions>;
    previous?: Partial<ConfirmDialogOptions>;
  };
}

interface StepData {
  [key: string]: any;
}

interface StepperFlow {
  [key: string]: string[];
}

interface StepperState {
  currentStepIndex: number;
  steps: StepMetadata[];
  data: StepData[];
  flows: StepperFlow;
  currentFlowKey: string | null;
}

export function useStepper({ initialState, stepperId, globalConfig }: StepperOptions) {
  const confirmationService = inject(ConfirmationServiceKey);
  
  if (!confirmationService) {
    throw new Error('ConfirmationService must be provided');
  }

  const defaultGlobalConfig: Required<GlobalConfig> = {
    confirmation: {
      previous: {
        enabled: false,
        message: 'Are you sure you want to go back? Your changes may be lost.',
        header: 'Confirmation',
        acceptLabel: 'Yes',
        rejectLabel: 'No'
      },
      next: {
        enabled: false,
        message: 'Are you sure you want to proceed to the next step?',
        header: 'Confirmation',
        acceptLabel: 'Yes',
        rejectLabel: 'No'
      }
    }
  };

  const config: Required<GlobalConfig> = {
    confirmation: {
      previous: {
        ...defaultGlobalConfig.confirmation.previous,
        ...(globalConfig?.confirmation?.previous || {})
      } as ConfirmDialogOptions,
      next: {
        ...defaultGlobalConfig.confirmation.next,
        ...(globalConfig?.confirmation?.next || {})
      } as ConfirmDialogOptions
    }
  };

  // Merged state object containing both steps metadata and state data
  const state = useLocalStorage<StepperState>(`stepper_state_${stepperId}`, initialState ?? {
      currentStepIndex: 0,
      currentFlowKey: null,
      steps: [],
      data: [],
      flows: {},
  }, {
    deep: true,
  });

  // Getter for currentStep
  const getCurrentStepIndex = computed(() => state.value.currentStepIndex);

  // Setter for currentStep
  const setCurrentStepIndex = (step: number) => {
    if (!state.value.currentFlowKey) {
        throw new Error('No flow defined');
    }
    
    if (step >= 0 && step < state.value.flows[state.value.currentFlowKey].length) {
        state.value.currentStepIndex = step;
    }
  };

  const setStepData = (data: Record<string, any>) => {
      state.value.data[state.value.currentStepIndex] = data
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

  const getCurrentStepConfig = computed(() => {
    const globalConfirmation = config.confirmation;
    const currentStep = state.value.steps[state.value.currentStepIndex];
    
    if (!currentStep) return globalConfirmation;

    return {
      next: {
        ...globalConfirmation.next,
        ...(currentStep.confirmation?.next || {})
      },
      previous: {
        ...globalConfirmation.previous,
        ...(currentStep.confirmation?.previous || {})
      }
    };
  });

  const goToNextStep = async () => {
    if (!state.value.currentFlowKey) {
      return;
    }

    const currentFlow = state.value.flows[state.value.currentFlowKey];
    const handleNext = () => {
      if (state.value.currentStepIndex < currentFlow.length - 1) {
        state.value.currentStepIndex++;
      }
    };

    const stepConfig = getCurrentStepConfig.value;
    if (stepConfig?.next?.enabled) {
      confirmationService.confirm({
        message: stepConfig.next.message,
        header: stepConfig.next.header,
        icon: 'pi pi-arrow-right',
        acceptLabel: stepConfig.next.acceptLabel,
        rejectLabel: stepConfig.next.rejectLabel,
        accept: handleNext,
        reject: () => {
          // Do nothing when rejected
        }
      });
    } else {
      handleNext();
    }
  };

  const goToPreviousStep = async () => {
    const handleGoBack = () => {
      if (state.value.currentStepIndex > 0) {
        state.value.currentStepIndex--;
      }
    };

    const stepConfig = getCurrentStepConfig.value;
    if (stepConfig?.previous?.enabled) {
      confirmationService.confirm({
        message: stepConfig.previous.message,
        header: stepConfig.previous.header,
        icon: 'pi pi-arrow-left',
        acceptLabel: stepConfig.previous.acceptLabel,
        rejectLabel: stepConfig.previous.rejectLabel,
        accept: handleGoBack,
        reject: () => {
          // Do nothing when rejected
        }
      });
    } else {
      handleGoBack();
    }
  };

  // Method to validate step data
  const validateStepData = ({stepIndex, validationCallback}: {stepIndex?: number, validationCallback?: () => boolean}) => {
      const indexToValidate = stepIndex ?? state.value.currentStepIndex;

      if (!state.value.steps[indexToValidate]) {
        console.warn(`Step ${indexToValidate + 1} not found`);
        state.value.steps[indexToValidate] = {isValid: false, title: ''};
        return false;
      }

      if (validationCallback) {
        state.value.steps[indexToValidate].isValid = validationCallback();
        return state.value.steps[indexToValidate].isValid;
      }

      state.value.steps[indexToValidate].isValid = state.value.data[indexToValidate] !== undefined && state.value.data[indexToValidate] !== null;
      return state.value.steps[indexToValidate].isValid;
  };


  const isStepValid = computed(() => {
    if (!state.value.steps[state.value.currentStepIndex]) {
      return false;
    }

    return state.value.steps[state.value.currentStepIndex].isValid;
  });

  // Method for a step to register itself
  const registerStep = (metadata: StepMetadata, stepIndex?: number) => {
      if (stepIndex !== undefined && stepIndex >= 0 && stepIndex < state.value.steps.length) {
          state.value.steps[stepIndex] = metadata;
      } else {
        state.value.steps[state.value.currentStepIndex] = metadata;
      }
  };

  const isLastStep = computed(() => {
    if (!state.value.currentFlowKey || !(state.value.flows instanceof Object)) {
      throw new Error('No default flow defined');
    }

    return state.value.currentStepIndex === state.value.flows[state.value.currentFlowKey].length - 1;
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
      return;
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

  return {
      // State (read only)
      currentStepIndex: getCurrentStepIndex,
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
      validateStepData,
      isStepValid,
      isLastStep,
      isFirstStep,

      // Methods
      allStepsBeforeAreValid,

      globalConfig: readonly(config),
      getCurrentStepConfig: readonly(getCurrentStepConfig),
  };
}

