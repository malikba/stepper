import type { InjectionKey } from 'vue';

export interface ConfirmationOptions {
  message?: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void;
  reject?: () => void;
}

export interface ConfirmationService {
  confirm: (options: ConfirmationOptions) => void;
}

export const ConfirmationServiceKey: InjectionKey<ConfirmationService> = Symbol('ConfirmationService'); 