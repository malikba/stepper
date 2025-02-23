import type { InjectionKey } from 'vue';
import type { useStepperMachine } from '../composables/useStepperMachine';

export const StepperKey: InjectionKey<ReturnType<typeof useStepperMachine>> = Symbol('Stepper'); 