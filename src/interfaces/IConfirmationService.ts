export interface IConfirmationOptions {
  message?: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void;
  reject?: () => void;
}

export interface IConfirmationService {
  confirm(options: IConfirmationOptions): void;
} 