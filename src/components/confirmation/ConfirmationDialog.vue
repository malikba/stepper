<script setup lang="ts">
import { ref } from 'vue';
import type { ConfirmationOptions } from '../../symbols/confirmation';

const isVisible = ref(false);
const options = ref<ConfirmationOptions>({});

const show = (newOptions: ConfirmationOptions) => {
  options.value = newOptions;
  isVisible.value = true;
};

const hide = () => {
  isVisible.value = false;
  options.value = {};
};

const handleAccept = () => {
  options.value.accept?.();
  hide();
};

const handleReject = () => {
  options.value.reject?.();
  hide();
};

defineExpose({
  show
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="confirmation-overlay"
      @click="handleReject"
    >
      <div
        class="confirmation-dialog"
        @click.stop
      >
        <div class="confirmation-header">
          <span class="confirmation-title">{{ options.header || 'Confirmation' }}</span>
        </div>
        <div class="confirmation-content">
          <i
            v-if="options.icon"
            :class="options.icon"
          />
          <p>{{ options.message || 'Are you sure?' }}</p>
        </div>
        <div class="confirmation-footer">
          <button
            class="btn btn-secondary"
            @click="handleReject"
          >
            {{ options.rejectLabel || 'No' }}
          </button>
          <button
            class="btn btn-primary"
            @click="handleAccept"
          >
            {{ options.acceptLabel || 'Yes' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation-dialog {
  background: var(--surface-card);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 400px;
  margin: 1rem;
}

.confirmation-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.confirmation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.confirmation-content {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.confirmation-content p {
  margin: 0;
  color: var(--text-color);
}

.confirmation-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--surface-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: var(--primary-color-text);
}

.btn-primary:hover {
  background: var(--primary-600);
}

.btn-secondary {
  background: var(--surface-ground);
  color: var(--text-color);
}

.btn-secondary:hover {
  background: var(--surface-hover);
}
</style> 