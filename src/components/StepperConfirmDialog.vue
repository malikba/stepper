<script setup lang="ts">
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';

defineProps<{
  position?: string;
}>();
</script>

<template>
  <ConfirmDialog :position="position">
    <template #message="slotProps">
      <div class="flex flex-column align-items-center w-full gap-3 surface-border">
        <i :class="[
          'text-5xl mb-3',
          {
            'pi pi-arrow-right text-primary-500': slotProps.message.header.includes('Next') || slotProps.message.header.includes('Validate'),
            'pi pi-arrow-left text-warning-500': slotProps.message.header.includes('Previous') || slotProps.message.header.includes('Reset')
          }
        ]"></i>
        <span class="font-bold text-xl mb-2">{{ slotProps.message.header }}</span>
        <p class="text-center">{{ slotProps.message.message }}</p>
      </div>
    </template>
    <template #footer="{ reject, accept, message }">
      <div class="flex justify-content-center gap-2">
        <Button 
          :label="message.rejectLabel || 'No'" 
          icon="pi pi-times" 
          @click="reject()" 
          text
        />
        <Button 
          :label="message.acceptLabel || 'Yes'" 
          icon="pi pi-check" 
          @click="accept()" 
          severity="primary"
        />
      </div>
    </template>
  </ConfirmDialog>
</template>

<style scoped>
:deep(.p-confirm-dialog) {
  .p-dialog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style> 