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
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Initialize with some default values
    const initialState = {
      currentStepIndex: 0,
      steps: [],
      data: [],
      flows: { default: ['StepOne', 'StepTwo', 'StepThree'] },
      currentFlowKey: 'default'
    }
    stepper = useStepper({ stepperId, initialState })
  })

  describe('initialization', () => {
    beforeEach(() => {
      localStorage.clear()
      mockConfirmationService.confirm.mockClear()
      // Override with empty state for initialization tests
      stepper = useStepper({ stepperId })
    })

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

    it('should store step data at current index', () => {
      const testData1 = { name: 'John' }
      const testData2 = { email: 'john@example.com' }
      
      stepper.setStepData(testData1)
      stepper.setCurrentStepIndex(1)
      stepper.setStepData(testData2)
      
      expect(stepper.getStepData(0)).toEqual(testData1)
      expect(stepper.getStepData(1)).toEqual(testData2)
    })

    it('should get step data for specific index', () => {
      const testData1 = { name: 'John' }
      const testData2 = { email: 'john@example.com' }
      
      stepper.setStepData(testData1)
      stepper.setCurrentStepIndex(1)
      stepper.setStepData(testData2)
      
      expect(stepper.getStepData(0)).toEqual(testData1)
      expect(stepper.getStepData()).toEqual(testData2) // Gets current step data when no index provided
    })

    it('should handle undefined or null step data', () => {
      expect(stepper.getStepData()).toBeUndefined()
      stepper.setStepData(null)
      expect(stepper.getStepData()).toBeNull()
    })
  })

  describe('flow management', () => {
    beforeEach(() => {
      localStorage.clear()
      mockConfirmationService.confirm.mockClear()
      // Override with empty state for flow management tests
      stepper = useStepper({ stepperId })
    })

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

    it('should validate step with specific index', () => {
      stepper.registerStep({ title: 'Step 2', isValid: false }, 1)
      const validationCallback = () => true
      expect(stepper.validateStepData({ stepIndex: 1, validationCallback })).toBe(true)
      expect(stepper.state.value.steps[1].isValid).toBe(true)
    })

    it('should validate step without callback', () => {
      stepper.setStepData({ name: 'John' })
      expect(stepper.validateStepData({})).toBe(true)
      expect(stepper.state.value.steps[0].isValid).toBe(true)
    })

    it('should check if all previous steps are valid', async () => {
      stepper.registerStep({ title: 'Step 1', isValid: true }, 0)
      stepper.registerStep({ title: 'Step 2', isValid: true }, 1)
      stepper.registerStep({ title: 'Step 3', isValid: false }, 2)
      
      await nextTick()
      
      // When checking index 2, it verifies steps 0 and 1 are valid
      expect(stepper.allStepsBeforeAreValid(2)).toBe(true)
      
      // When checking index 1, it verifies only step 0 is valid
      expect(stepper.allStepsBeforeAreValid(1)).toBe(true)
      
      // When checking index 3, it verifies steps 0, 1, and 2 are valid
      expect(stepper.allStepsBeforeAreValid(3)).toBe(false)
    })

    it('should handle validation for non-existent steps', () => {
      expect(stepper.validateStepData({ stepIndex: 999 })).toBe(false)
      expect(console.warn).toHaveBeenCalledWith('Step 1000 not found')
    })
  })

  describe('computed properties', () => {
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
      
      // Register steps
      stepper.registerStep(metadata1, 0)
      stepper.registerStep(metadata2, 1)

      // Verify both steps are registered correctly
      expect(stepper.state.value.steps[0]).toEqual(metadata1)
      expect(stepper.state.value.steps[1]).toEqual(metadata2)

      // Now test getStepMetadata
      const retrievedMetadata = stepper.getStepMetadata(1)
      expect(retrievedMetadata).toEqual(metadata2)
      expect(retrievedMetadata.title).toBe('Step 2')
      expect(retrievedMetadata.isValid).toBe(false)
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