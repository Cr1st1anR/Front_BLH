export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface FormValidation {
  errors: FormErrors;
  isValid: boolean;
  firstError?: string;
}

export interface FieldValidation {
  fieldName: string;
  value: any;
  required: boolean;
  errorMessage?: string;
}

export interface ValidationConfig {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | null;
}
