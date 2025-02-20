import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStepper } from '../useStepper';
import { nextTick } from 'vue';

const mockConfirmationService = {
  confirm: vi.fn((options) => {
    if (options.accept) options.accept();
  })
};

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual as any,
    inject: () => mockConfirmationService
  };
});

describe('useStepper', () => {
  const stepperId = 'test-stepper'
  let stepper: ReturnType<typeof useStepper>

  beforeEach(() => {
    localStorage.clear()
    mockConfirmationService.confirm.mockClear()
    stepper = useStepper({ stepperId })
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(stepper.currentStepIndex.value).toBe(0)
      expect(stepper.state.value.steps).toEqual([])
      expect(stepper.state.value.data).toEqual([])
      expect(stepper.state.value.flows).toEqual({})
      expect(stepper.state.value.currentFlowKey).toBeNull()
    })

    it('should initialize with provided values and global config', () => {
      const initialState = {
        currentStepIndex: 1,
        steps: [{ title: 'Step 1', isValid: true }],
        data: [{ name: 'John' }],
        flows: { default: ['StepOne'] },
        currentFlowKey: 'default'
      }

      const globalConfig = {
        confirmation: {
          next: {
            enabled: true,
            message: 'Custom next message'
          }
        }
      }

      stepper = useStepper({ initialState, stepperId, globalConfig })
      expect(stepper.state.value).toEqual(initialState)
      const config = stepper.globalConfig
      expect(config.confirmation.next?.message).toBe('Custom next message')
    })
  })

  describe('navigation with confirmation', () => {
    beforeEach(() => {
      stepper.setFlows({ default: ['StepOne', 'StepTwo', 'StepThree'] })
      stepper.setCurrentFlow('default')
    })

    it('should go to next step with confirmation when enabled', async () => {
      stepper.registerStep({
        title: 'Step 1',
        isValid: true,
        confirmation: {
          next: {
            enabled: true,
            message: 'Confirm next?'
          }
        }
      })

      await stepper.goToNextStep()
      expect(mockConfirmationService.confirm).toHaveBeenCalled()
      expect(stepper.currentStepIndex.value).toBe(1)
    })

    it('should go to previous step with confirmation when enabled', async () => {
      stepper.setCurrentStepIndex(1)
      stepper.registerStep({
        title: 'Step 2',
        isValid: true,
        confirmation: {
          previous: {
            enabled: true,
            message: 'Confirm previous?'
          }
        }
      }, 1)

      await stepper.goToPreviousStep()
      expect(mockConfirmationService.confirm).toHaveBeenCalled()
      expect(stepper.currentStepIndex.value).toBe(0)
    })

    it('should not go to next step when confirmation is rejected', async () => {
      mockConfirmationService.confirm.mockImplementationOnce((options) => {
        if (options.reject) options.reject();
      })

      stepper.registerStep({
        title: 'Step 1',
        isValid: true,
        confirmation: {
          next: {
            enabled: true
          }
        }
      })

      await stepper.goToNextStep()
      expect(mockConfirmationService.confirm).toHaveBeenCalled()
      expect(stepper.currentStepIndex.value).toBe(0)
    })
  })

  describe('navigation', () => {
    beforeEach(() => {
      stepper.setFlows({ default: ['StepOne', 'StepTwo', 'StepThree'] })
      stepper.setCurrentFlow('default')
    })

    it('should go to next step', () => {
      stepper.goToNextStep()
      expect(stepper.currentStepIndex.value).toBe(1)
    })

    it('should not go beyond last step', () => {
      stepper.setCurrentStepIndex(2)
      stepper.goToNextStep()
      expect(stepper.currentStepIndex.value).toBe(2)
    })

    it('should go to previous step', () => {
      stepper.setCurrentStepIndex(1)
      stepper.goToPreviousStep()
      expect(stepper.currentStepIndex.value).toBe(0)
    })

    it('should not go before first step', () => {
      stepper.goToPreviousStep()
      expect(stepper.currentStepIndex.value).toBe(0)
    })
  })

  describe('step data management', () => {
    it('should set and get step data', () => {
      const testData = { name: 'John' }
      stepper.setStepData(testData)
      expect(stepper.getStepData()).toEqual(testData)
    })

    it('should merge new data with existing data', () => {
      stepper.setStepData({ name: 'John' })
      stepper.setStepData({ age: 30 })
      expect(stepper.getStepData()).toEqual({ name: 'John', age: 30 })
    })
  })

  describe('flow management', () => {
    it('should set and get flows', () => {
      const flows = { default: ['StepOne', 'StepTwo'] }
      stepper.setFlows(flows)
      expect(stepper.getFlows()).toEqual(flows)
    })

    it('should set current flow', () => {
      const flows = { default: ['StepOne', 'StepTwo'] }
      stepper.setFlows(flows)
      stepper.setCurrentFlow('default')
      expect(stepper.getCurrentFlowKey()).toBe('default')
      expect(stepper.currentStepIndex.value).toBe(0)
    })

    it('should return undefined when accessing currentFlow without setting flow', () => {
      expect(stepper.currentFlow.value).toBeUndefined()
    })
  })

  describe('step validation', () => {
    beforeEach(() => {
      stepper.registerStep({ title: 'Step 1', isValid: false })
    })

    it('should validate step with callback', () => {
      const validationCallback = () => true
      expect(stepper.validateStepData({ validationCallback })).toBe(true)
      expect(stepper.state.value.steps[0].isValid).toBe(true)
    })

    it('should validate step without callback', () => {
      stepper.setStepData({ name: 'John' })
      expect(stepper.validateStepData({})).toBe(true)
    })

    it('should check if all previous steps are valid', async () => {
      stepper.registerStep({ title: 'Step 1', isValid: true }, 0)
      stepper.registerStep({ title: 'Step 2', isValid: true }, 1)
      stepper.registerStep({ title: 'Step 3', isValid: false }, 2)
      
      await nextTick()
      
      expect(stepper.allStepsBeforeAreValid(2)).toBe(true)
      expect(stepper.allStepsBeforeAreValid(3)).toBe(false)
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      stepper.setFlows({ default: ['StepOne', 'StepTwo', 'StepThree'] })
      stepper.setCurrentFlow('default')
    })

    it('should determine if current step is last', () => {
      stepper.setCurrentStepIndex(2)
      expect(stepper.isLastStep.value).toBe(true)
    })

    it('should determine if current step is first', () => {
      expect(stepper.isFirstStep.value).toBe(true)
      stepper.setCurrentStepIndex(1)
      expect(stepper.isFirstStep.value).toBe(false)
    })

    it('should get current step component', () => {
      expect(stepper.currentStepComponent.value).toBe('StepOne')
    })
  })

  describe('step metadata', () => {
    it('should get and set step metadata', () => {
      const metadata = { title: 'Test Step', isValid: true }
      stepper.registerStep(metadata)
      expect(stepper.getStepMetadata()).toEqual(metadata)
    })

    it('should get step metadata for specific index', () => {
      const metadata1 = { title: 'Step 1', isValid: true }
      const metadata2 = { title: 'Step 2', isValid: false }
      stepper.registerStep(metadata1, 0)
      stepper.registerStep(metadata2, 1)
      expect(stepper.getStepMetadata(1)).toEqual(metadata2)
    })
  })

  describe('step configuration', () => {
    it('should get current step configuration', () => {
      const stepConfig = {
        title: 'Step 1',
        isValid: true,
        confirmation: {
          next: {
            enabled: true,
            message: 'Step specific message'
          }
        }
      }

      stepper.registerStep(stepConfig)
      const config = stepper.getCurrentStepConfig.value
      expect(config.next?.enabled).toBe(true)
      expect(config.next?.message).toBe('Step specific message')
    })

    it('should merge global and step specific configurations', () => {
      const globalConfig = {
        confirmation: {
          next: {
            enabled: true,
            message: 'Global message',
            header: 'Global header'
          }
        }
      }

      stepper = useStepper({ stepperId, globalConfig })
      
      stepper.registerStep({
        title: 'Step 1',
        isValid: true,
        confirmation: {
          next: {
            message: 'Step message'
          }
        }
      })

      const config = stepper.getCurrentStepConfig.value
      expect(config.next?.enabled).toBe(true)
      expect(config.next?.message).toBe('Step message')
      expect(config.next?.header).toBe('Global header')
    })
  })
}) 