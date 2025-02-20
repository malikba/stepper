import type { InjectionKey } from 'vue'
import type { IConfirmationService } from '../interfaces/IConfirmationService'

export const ConfirmationServiceKey: InjectionKey<IConfirmationService> = Symbol('ConfirmationService') 