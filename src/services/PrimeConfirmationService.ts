import { useConfirm } from 'primevue/useconfirm';
import { IConfirmationService, IConfirmationOptions } from '../interfaces/IConfirmationService';

export class PrimeConfirmationService implements IConfirmationService {
  private confirmService: any;

  constructor() {
    this.confirmService = useConfirm();
  }

  confirm(options: IConfirmationOptions): void {
    this.confirmService.require({
      message: options.message,
      header: options.header,
      icon: options.icon,
      acceptLabel: options.acceptLabel,
      rejectLabel: options.rejectLabel,
      accept: options.accept,
      reject: options.reject
    });
  }
}