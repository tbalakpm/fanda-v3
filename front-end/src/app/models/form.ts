export interface Form {
  formControlName: string;
  fieldName: string;
  value: any;
  controlType:
    | 'text'
    | 'textarea'
    | 'password'
    | 'number'
    | 'checkbox'
    | 'radio'
    | 'select'
    | 'multi-select';
  config: FormConfig;
  options?: Option[];
}

export interface FormConfig {
  min?: number;
  max?: number;
  required: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  // only for radio and checkbox
  layout?: 'vertical' | 'horizontal';
  checked?: boolean;
  // only for select and select
  searchable?: boolean;
}

export interface Option {
  value: string | boolean;
  label: string;
}
