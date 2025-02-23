import { createMachine, createActor } from 'xstate';
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

// Define the context and events for the state machine
interface StepperContext {
  state: StepperState;
  config: Required<GlobalConfig>;
}

type StepperEvent =
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'CONFIRM' }
  | { type: 'REJECT' }
  | { type: 'SET_STEP'; index: number }
  | { type: 'SET_FLOW'; flowKey: string }
  | { type: 'SET_DATA'; data: StepData }
  | { type: 'REGISTER_STEP'; metadata: StepMetadata; index?: number }
  | { type: 'VALIDATE_STEP'; index?: number; callback?: () => boolean };

const createStepperMachine = (initialContext: StepperContext) => {
  return createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAcD2BbVFUCdYDpMBLAOzADpcAnMbPEgFwGMBiAS1oGswBrRgGwAEABQC2AZQDaABgC6iUAAdUsYrFKVEoAB6IAjAE4AzKQAsATgDMANgAcpAKwBGADQgAnogMZSAX1-m0TFx8IhJyKloGZjYOLl5+QRExCWk5RWU1DS0dPQNjU3NLGwRHFzcPL19-QKCQsIiomPjE5NT0rNz8oqKSsorqmrqG5paINo7u3v7BoZGxyenZ+cXl1fXN7d39w9PL28f359fv-6CQsIiY+KSUtMzsnLzC4tLyysrauob65paIVo6evoGRiZmFtZ2Dk4uMG5efiEBEJRBIpLJ5EoVOoNFodHoDEZTOYrDY7I5XB4vL4-AEQmFIjE4olkqk0pkctl8oUSpVqrVGi02h0uj1+oNhqMJlNZgtlmtNjs9kcTmcLlcbndHi83h8vj9-kDQeDIVCYXDEciUWiMVjcfiCUSScTyZTqbS6QyWUz2ZyeXyBUKRWLJdK5QqVWqNVqdXqjSazVa7U63V6-UGwxG4ymMzmC2Wqw2Wz2hy2p3OF2udy+D2+vz+gOBIOh4IR8KRqPRmOxuPxhKJJLJFKpdMZzNZHK5vP5gsF4slMrlCqVKrVWr1RpNZqtdodLrdXr9QbDUbjSbTWbzRarDbbXaHY6nc7XW73R6vT7fX7-QGg8GQmHwhFI5Go9GYnF4wkksnUunMlmsjl8wXCoUSqUy+WKpWqjXajW63X6w3G03mi1Wm12h1O11e70+v0B4NhiNRmPxpOp9OZrM53OF4ul8uVqs12t1hs95tN1tt9sdztdns9vv9gcDwdD4cj0fjieTqfTmezufzheLpfLler9cbzdbne7vf7w+H4+nk9ny-Xm+32-3x9P58v19vj-fz8-n6-P9-f7+v3--4AAA */
    id: 'stepper',
    initial: 'idle',
    context: initialContext,
    states: {
      idle: {
        on: {
          NEXT: {
            target: 'validating',
            guard: 'canGoNext'
          },
          PREVIOUS: {
            target: 'confirming',
            guard: 'canGoPrevious'
          },
          SET_STEP: {
            actions: ['setStep'],
            guard: 'isValidStepIndex'
          },
          SET_FLOW: {
            actions: ['setFlow'],
            guard: 'isValidFlow'
          },
          SET_DATA: {
            actions: ['setData']
          },
          REGISTER_STEP: {
            actions: ['registerStep']
          },
          VALIDATE_STEP: {
            actions: ['validateStep']
          }
        }
      },
      validating: {
        always: [
          {
            target: 'confirming',
            guard: 'needsConfirmation'
          },
          {
            target: 'navigating',
            actions: ['handleNext']
          }
        ]
      },
      confirming: {
        on: {
          CONFIRM: {
            target: 'navigating',
            actions: ['handleNext']
          },
          REJECT: {
            target: 'idle'
          }
        }
      },
      navigating: {
        after: {
          0: 'idle'
        }
      }
    }
  }, {
    guards: {
      canGoNext: ({ context }) => {
        const { currentFlowKey } = context.state;
        if (!currentFlowKey) return false;
        const currentFlow = context.state.flows[currentFlowKey];
        return Array.isArray(currentFlow) && context.state.currentStepIndex < currentFlow.length - 1;
      },
      canGoPrevious: ({ context }) => {
        return context.state.currentStepIndex > 0;
      },
      isValidStepIndex: ({ context, event }) => {
        if (event.type !== 'SET_STEP') return false;
        const { currentFlowKey } = context.state;
        if (!currentFlowKey) return false;
        const currentFlow = context.state.flows[currentFlowKey];
        return Array.isArray(currentFlow) && event.index >= 0 && event.index < currentFlow.length;
      },
      isValidFlow: ({ context, event }) => {
        if (event.type !== 'SET_FLOW') return false;
        return Object.prototype.hasOwnProperty.call(context.state.flows, event.flowKey);
      },
      needsConfirmation: ({ context }) => {
        const currentStep = context.state.steps[context.state.currentStepIndex];
        return Boolean(currentStep?.confirmation?.next?.enabled || context.config.confirmation?.next?.enabled);
      }
    },
    actions: {
      handleNext: ({ context }) => {
        const { currentFlowKey } = context.state;
        if (!currentFlowKey) return;
        const currentFlow = context.state.flows[currentFlowKey];
        if (Array.isArray(currentFlow) && context.state.currentStepIndex < currentFlow.length - 1) {
          context.state.currentStepIndex++;
        }
      },
      handlePrevious: ({ context }) => {
        if (context.state.currentStepIndex > 0) {
          context.state.currentStepIndex--;
        }
      },
      setStep: ({ context, event }) => {
        if (event.type === 'SET_STEP') {
          context.state.currentStepIndex = event.index;
        }
      },
      setFlow: ({ context, event }) => {
        if (event.type === 'SET_FLOW') {
          context.state.currentFlowKey = event.flowKey;
          context.state.currentStepIndex = 0;
          context.state.data = [];
        }
      },
      setData: ({ context, event }) => {
        if (event.type === 'SET_DATA') {
          context.state.data[context.state.currentStepIndex] = event.data;
        }
      },
      registerStep: ({ context, event }) => {
        if (event.type === 'REGISTER_STEP') {
          const { metadata, index } = event;
          if (typeof index === 'number' && index >= 0 && index < context.state.steps.length) {
            context.state.steps[index] = metadata;
          } else {
            context.state.steps[context.state.currentStepIndex] = metadata;
          }
        }
      },
      validateStep: ({ context, event }) => {
        if (event.type === 'VALIDATE_STEP') {
          const { index, callback } = event;
          const indexToValidate = typeof index === 'number' ? index : context.state.currentStepIndex;

          if (!context.state.steps[indexToValidate]) {
            console.warn(`Step ${indexToValidate + 1} not found`);
            context.state.steps[indexToValidate] = { isValid: false, title: '' };
            return;
          }

          context.state.steps[indexToValidate].isValid = callback 
            ? callback()
            : context.state.data[indexToValidate] != null;
        }
      }
    }
  });
};

export function useStepperMachine({ initialState, stepperId, globalConfig }: StepperOptions) {
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

  // Initialize state with localStorage
  const state = useLocalStorage<StepperState>(`stepper_state_${stepperId}`, initialState ?? {
    currentStepIndex: 0,
    currentFlowKey: null,
    steps: [],
    data: [],
    flows: {},
  }, {
    deep: true,
  });

  // Create and start the state machine
  const machine = createStepperMachine({
    state: state.value,
    config
  });

  const service = createActor(machine).start();

  // Computed properties
  const getCurrentStepIndex = computed(() => state.value.currentStepIndex);

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

  // Navigation methods
  const goToNextStep = async () => {
    if (!state.value.currentFlowKey) {
      return;
    }

    const currentFlow = state.value.flows[state.value.currentFlowKey];
    const handleNext = () => {
      if (state.value.currentStepIndex < currentFlow.length - 1) {
        service.send({ type: 'NEXT' });
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
        service.send({ type: 'PREVIOUS' });
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

  // Step management methods
  const setCurrentStepIndex = (step: number) => {
    if (!state.value.currentFlowKey) {
      throw new Error('No flow defined');
    }
    
    if (step >= 0 && step < state.value.flows[state.value.currentFlowKey].length) {
      service.send({ type: 'SET_STEP', index: step });
    }
  };

  const setStepData = (data: Record<string, any>) => {
    service.send({ type: 'SET_DATA', data });
  };

  const registerStep = (metadata: StepMetadata, stepIndex?: number) => {
    service.send({ type: 'REGISTER_STEP', metadata, index: stepIndex });
  };

  // Flow management methods
  const setFlows = (newFlows: { [key: string]: ComponentInstance<any>[] }) => {
    state.value.flows = newFlows;
  };

  const setCurrentFlow = (flowKey: string) => {
    if (state.value.flows.hasOwnProperty(flowKey)) {
      service.send({ type: 'SET_FLOW', flowKey });
    } else {
      console.warn(`Flow with key "${flowKey}" does not exist.`);
    }
  };

  // Validation methods
  const validateStepData = ({stepIndex, validationCallback}: {stepIndex?: number, validationCallback?: () => boolean}) => {
    service.send({ type: 'VALIDATE_STEP', index: stepIndex, callback: validationCallback });
    return state.value.steps[stepIndex ?? state.value.currentStepIndex]?.isValid ?? false;
  };

  // Computed properties
  const isStepValid = computed(() => {
    if (!state.value.steps[state.value.currentStepIndex]) {
      return false;
    }
    return state.value.steps[state.value.currentStepIndex].isValid;
  });

  const isLastStep = computed(() => {
    if (!state.value.currentFlowKey || !(state.value.flows instanceof Object)) {
      throw new Error('No default flow defined');
    }
    return state.value.currentStepIndex === state.value.flows[state.value.currentFlowKey].length - 1;
  });

  const isFirstStep = computed(() => {
    return state.value.currentStepIndex === 0;
  });

  const currentFlow = computed(() => {
    if (!state.value.currentFlowKey || !(state.value.flows instanceof Object)) {
      return;
    }
    return state.value.flows[state.value.currentFlowKey];
  });

  const currentStepComponent = computed(() => {
    if (!state.value.currentFlowKey) {
      return null;
    }
    return currentFlow.value?.[state.value.currentStepIndex];
  });

  // Utility methods
  const getStepData = (stepIndex?: number) => {
    return state.value.data[stepIndex ?? state.value.currentStepIndex];
  };

  const getStepState = (stepIndex?: number) => {
    return state.value.data[stepIndex ?? state.value.currentStepIndex];
  };

  const getStepMetadata = (stepIndex?: number) => {
    return state.value.steps[stepIndex ?? state.value.currentStepIndex];
  };

  const getFlows = () => {
    return state.value.flows;
  };

  const getCurrentFlowKey = () => {
    return state.value.currentFlowKey;
  };

  const allStepsBeforeAreValid = (index: number): boolean => {
    return !Array.from({ length: index }, () => null)
      .some((_, i) => !state.value.steps.at(i)?.isValid);
  };

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

    // Configuration
    globalConfig: readonly(config),
    getCurrentStepConfig: readonly(getCurrentStepConfig),

    // State machine service
    service
  };
} 