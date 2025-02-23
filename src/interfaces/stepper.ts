
export interface ConfirmDialogOptions {
  enabled: boolean;
  message?: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
}

export interface GlobalConfig {
  confirmation?: {
    next?: Partial<ConfirmDialogOptions>;
    previous?: Partial<ConfirmDialogOptions>;
  };
}

export interface StepMetadata {
  title: string;
  isValid: boolean;
  componentName?: string;
  confirmation?: {
    next?: Partial<ConfirmDialogOptions>;
    previous?: Partial<ConfirmDialogOptions>;
  };
}

export interface StepData {
  [key: string]: any;
}

export interface StepperFlow {
  [key: string]: string[];
}

export interface StepperState {
  currentStepIndex: number;
  steps: StepMetadata[];
  data: StepData[];
  flows: StepperFlow;
  currentFlowKey: string | null;
}

export interface StepperOptions {
  initialState?: StepperState;
  stepperId: string;
  globalConfig?: GlobalConfig;
} 