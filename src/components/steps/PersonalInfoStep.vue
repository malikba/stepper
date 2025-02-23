<script setup lang="ts">
import { ref, watch } from 'vue';
import { inject, onBeforeMount } from 'vue';
import { StepperKey } from '../../symbols/stepper';

const stepper = inject(StepperKey);
if (!stepper) {
  throw new Error('Step must be used within StepperProvider');
}

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
});

const validateForm = () => {
  const isValid = formData.value.firstName && 
                 formData.value.lastName && 
                 formData.value.email &&
                 /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email);
  
  stepper.validateStepData({ validationCallback: () => isValid });
  return isValid;
};

watch(formData, (newData) => {
  stepper.setStepData(newData);
  validateForm();
}, { deep: true });

onBeforeMount(() => {
  stepper.registerStep({
    title: 'Personal Information',
    isValid: false,
    confirmation: {
      next: {
        enabled: true,
        message: 'Are you sure you want to proceed? Please verify your information.',
        header: 'Confirm Information'
      }
    }
  });
  stepper.setStepData(formData.value);
});
</script>

<template>
  <div class="personal-info-step">
    <h2>Personal Information</h2>

    {{ validateForm() }}
    <div class="form-group">
      <label for="firstName">First Name</label>
      <input
        id="firstName"
        v-model="formData.firstName"
        type="text"
        class="form-control"
        placeholder="Enter your first name"
      >
    </div>
    <div class="form-group">
      <label for="lastName">Last Name</label>
      <input
        id="lastName"
        v-model="formData.lastName"
        type="text"
        class="form-control"
        placeholder="Enter your last name"
      >
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        class="form-control"
        placeholder="Enter your email"
      >
    </div>
  </div>
</template>

<style scoped>
.personal-info-step {
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