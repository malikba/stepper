import type { ConfirmationService, ConfirmationOptions } from '../symbols/confirmation';
import type ConfirmationDialog from '../components/confirmation/ConfirmationDialog.vue';

export class DefaultConfirmationService implements ConfirmationService {
  private dialog: typeof ConfirmationDialog | null = null;

  setDialog(dialog: typeof ConfirmationDialog) {
    this.dialog = dialog;
  }

  confirm(options: ConfirmationOptions) {
    if (!this.dialog) {
      console.warn('ConfirmationDialog not set');
      return;
    }
    this.dialog.show(options);
  }
} 