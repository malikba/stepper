<script setup lang="ts">
import { ref, watch } from 'vue';
import { inject, onBeforeMount } from 'vue';
import { StepperKey } from '../../symbols/stepper';

const stepper = inject(StepperKey);
if (!stepper) {
  throw new Error('Step must be used within StepperProvider');
}

const formData = ref({
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
});

const validateForm = () => {
  const isValid = formData.value.street && 
                 formData.value.city && 
                 formData.value.state && 
                 formData.value.zipCode &&
                 formData.value.country;
  
  stepper.validateStepData({ validationCallback: () => isValid });
  return isValid;
};

watch(formData, (newData) => {
  stepper.setStepData(newData);
  validateForm();
}, { deep: true });

onBeforeMount(() => {
  stepper.registerStep({
    title: 'Address Information',
    isValid: false,
    confirmation: {
      next: {
        enabled: true,
        message: 'Please confirm your address information is correct.',
        header: 'Confirm Address'
      }
    }
  });
  stepper.setStepData(formData.value);
});
</script>

<template>
  <div class="address-step">
    <h2>Address Information</h2>
    <div class="form-group">
      <label for="street">Street Address</label>
      <input
        id="street"
        v-model="formData.street"
        type="text"
        class="form-control"
        placeholder="Enter your street address"
      >
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="city">City</label>
        <input
          id="city"
          v-model="formData.city"
          type="text"
          class="form-control"
          placeholder="Enter your city"
        >
      </div>
      <div class="form-group">
        <label for="state">State/Province</label>
        <input
          id="state"
          v-model="formData.state"
          type="text"
          class="form-control"
          placeholder="Enter your state"
        >
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="zipCode">ZIP/Postal Code</label>
        <input
          id="zipCode"
          v-model="formData.zipCode"
          type="text"
          class="form-control"
          placeholder="Enter your ZIP code"
        >
      </div>
      <div class="form-group">
        <label for="country">Country</label>
        <input
          id="country"
          v-model="formData.country"
          type="text"
          class="form-control"
          placeholder="Enter your country"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.address-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 1rem;
}

label {
  font-weight: 500;
  color: var(--text-color);
}

.form-control {
  padding: 0.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--surface-ground);
  color: var(--text-color);
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-control::placeholder {
  color: var(--text-color-secondary);
}
</style> 