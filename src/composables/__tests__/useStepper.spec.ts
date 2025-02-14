import { describe, it, expect, beforeEach } from 'vitest'
import { useStepper } from '../useStepper'
import { nextTick } from 'process'

describe('useStepper', () => {
  const stepperId = 'test-stepper'
  let stepper: ReturnType<typeof useStepper>

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    
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

    it('should initialize with provided values', async () => {
      const initialState = {
        currentStepIndex: 1,
        steps: [{ title: 'Step 1', isValid: true }],
        data: [{ name: 'John' }],
        flows: { default: [] },
        currentFlowKey: 'default'
      }

      stepper = useStepper({ initialState, stepperId })
      await nextTick;
      expect(stepper.state.value.currentStepIndex).toBe(1)
      expect(stepper.state.value.steps).toEqual(initialState.steps)
      expect(stepper.state.value.data).toEqual(initialState.data)
    })
  })

  describe('navigation', () => {
    beforeEach(() => {
      stepper.setFlows({ default: ["1", "2", "3"] })
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
      const flows = { default: ["", ""] }
      stepper.setFlows(flows)
      expect(stepper.getFlows()).toEqual(flows)
    })

    it('should set current flow', () => {
      const flows = { default: ["", ""] }
      stepper.setFlows(flows)
      stepper.setCurrentFlow('default')
      expect(stepper.getCurrentFlowKey()).toBe('default')
      expect(stepper.currentStepIndex.value).toBe(0)
    })

    it('should throw error when accessing currentFlow without setting flow', () => {
      expect(() => stepper.currentFlow.value).toThrow('No default flow defined')
    })
  })

  describe('step validation', () => {
    beforeEach(() => {
      stepper.registerStep({ title: 'Step 1', isValid: false })
    })

    it('should validate step with callback', () => {
      const validationCallback = () => true
      expect(stepper.validateStepData({ stepIndex: 0, validationCallback })).toBe(true)
      expect(stepper.state.value.steps[0].isValid).toBe(true)
    })

    it('should validate step without callback', () => {
      stepper.setStepData({ name: 'John' })
      expect(stepper.validateStepData({ stepIndex: 0 })).toBe(true)
    })

    it('should check if all previous steps are valid', () => {
      stepper.registerStep({ title: 'Step 1', isValid: true }, 0)
      stepper.registerStep({ title: 'Step 2', isValid: true }, 1)
      stepper.registerStep({ title: 'Step 3', isValid: false }, 2)
      
      expect(stepper.allStepsBeforeAreValid(2)).toBe(true)
      expect(stepper.allStepsBeforeAreValid(3)).toBe(false)
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      stepper.setFlows({ default: ["", "", ""] })
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
      expect(stepper.currentStepComponent.value).toBeTruthy()
    })

    it('should throw error when accessing currentFlow without valid flow key', () => {
      stepper.setCurrentFlow('nonexistent')
      expect(() => stepper.currentFlow.value).toThrow('No default flow defined')
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
}) 