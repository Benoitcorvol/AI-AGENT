import { WorkflowStep, ValidationRule } from '../types/workflow';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateStep(
  step: WorkflowStep,
  input: Record<string, any>
): ValidationResult {
  if (!step.validation?.rules) {
    return { valid: true };
  }

  for (const rule of step.validation.rules) {
    const result = validateRule(rule, input);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

function validateRule(
  rule: ValidationRule,
  input: Record<string, any>
): ValidationResult {
  switch (rule.type) {
    case 'regex':
      return validateRegex(rule.value as string, input);
    case 'range':
      return validateRange(rule.value as number, input);
    case 'custom':
      return validateCustom(rule.value, input);
    default:
      return { valid: false, error: 'Unknown validation rule type' };
  }
}

function validateRegex(pattern: string, input: Record<string, any>): ValidationResult {
  try {
    const regex = new RegExp(pattern);
    const allValid = Object.values(input).every(value => 
      typeof value === 'string' && regex.test(value)
    );
    return {
      valid: allValid,
      error: allValid ? undefined : 'Input does not match required pattern'
    };
  } catch (error) {
    return { valid: false, error: 'Invalid regex pattern' };
  }
}

function validateRange(maxValue: number, input: Record<string, any>): ValidationResult {
  const allValid = Object.values(input).every(value =>
    typeof value === 'number' && value <= maxValue
  );
  return {
    valid: allValid,
    error: allValid ? undefined : 'Input exceeds maximum allowed value'
  };
}

function validateCustom(
  validator: any,
  input: Record<string, any>
): ValidationResult {
  try {
    if (typeof validator === 'function') {
      const result = validator(input);
      return {
        valid: Boolean(result),
        error: result ? undefined : 'Custom validation failed'
      };
    }
    return { valid: false, error: 'Invalid custom validator' };
  } catch (error) {
    return { valid: false, error: 'Custom validation error: ' + error.message };
  }
}