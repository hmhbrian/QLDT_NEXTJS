
/**
 * Enhanced Form Hooks
 * Enterprise-grade form handling with validation, async submission, and error management
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { z } from "zod";
import { useError } from "./use-error";
import { sanitizeFormData } from "@/lib/utils/form.utils";

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

interface FormField {
  value: any;
  error?: string;
  touched: boolean;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  validate: () => boolean;
  clearErrors: () => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
    resetOnSubmit = false,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>(
    {} as Record<keyof T, string>
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showError } = useError();
  const initialValuesRef = useRef(initialValues);

  // Update initial values ref when prop changes
  useEffect(() => {
    initialValuesRef.current = initialValues;
  }, [initialValues]);

  const validateField = useCallback(
    (field: keyof T, value: any): string => {
      if (!validationSchema) return "";

      try {
        // For single field validation, create a test object and validate the full schema
        // then extract the field-specific error if validation fails
        const testValue = { ...values, [field]: value } as T;
        validationSchema.parse(testValue);
        return "";
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Find the error specific to this field
          const fieldError = error.errors.find(
            (err) => err.path.length > 0 && err.path[0] === field
          );
          return fieldError?.message || "";
        }
        return "Validation error";
      }
    },
    [validationSchema, values]
  );

  const validateAllFields = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      const sanitizedValues = sanitizeFormData(values);
      validationSchema.parse(sanitizedValues);
      setErrors({} as Record<keyof T, string>);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, err) => {
          const field = err.path[0] as keyof T;
          if (field) {
            acc[field] = err.message;
          }
          return acc;
        }, {} as Record<keyof T, string>);
        setErrors(fieldErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validateOnChange, validateField]
  );

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValue(field, value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setFieldTouched(field, true);

      if (validateOnBlur) {
        const error = validateField(field, values[field]);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validateOnBlur, validateField, values, setFieldTouched]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      setIsSubmitting(true);

      try {
        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {} as Record<keyof T, boolean>);
        setTouched(allTouched);

        // Validate all fields
        const isValid = validateAllFields();
        if (!isValid) {
          throw new Error("Form validation failed");
        }

        // Sanitize and submit
        const sanitizedValues = sanitizeFormData(values) as T;
        await onSubmit(sanitizedValues);

        if (resetOnSubmit) {
          reset();
        }
      } catch (error) {
        showError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAllFields, onSubmit, resetOnSubmit, showError]
  );

  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues
      ? { ...initialValuesRef.current, ...newValues }
      : initialValuesRef.current;

    setValues(resetValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>);
  }, []);

  const isValid = Object.values(errors).every((error) => !error);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate: validateAllFields,
    clearErrors,
  };
}

/**
 * Hook for multi-step forms
 */
interface UseMultiStepFormOptions<T> {
  steps: Array<{
    name: string;
    schema?: z.ZodSchema<Partial<T>>;
    onStepComplete?: (values: T) => Promise<void> | void;
  }>;
  initialValues: T;
  onComplete: (values: T) => Promise<void> | void;
}

export function useMultiStepForm<T extends Record<string, any>>(
  options: UseMultiStepFormOptions<T>
) {
  const { steps, initialValues, onComplete } = options;

  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Partial<T>[]>(steps.map(() => ({})));

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const allValues = stepData.reduce(
    (acc, data) => ({ ...acc, ...data }),
    initialValues
  ) as T;

  const form = useForm({
    initialValues: { ...initialValues, ...stepData[currentStep] },
    validationSchema: currentStepConfig?.schema as any,
    onSubmit: async (values) => {
      // Update step data
      const newStepData = [...stepData];
      newStepData[currentStep] = values;
      setStepData(newStepData);

      // Run step completion handler
      if (currentStepConfig?.onStepComplete) {
        await currentStepConfig.onStepComplete(allValues);
      }

      if (isLastStep) {
        // Complete the form
        await onComplete(allValues);
      } else {
        // Go to next step
        setCurrentStep((prev) => prev + 1);
      }
    },
  });

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
      }
    },
    [steps.length]
  );

  const goToPrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const goToNext = useCallback(() => {
    form.handleSubmit();
  }, [form]);

  return {
    ...form,
    currentStep,
    currentStepName: currentStepConfig?.name,
    totalSteps: steps.length,
    isFirstStep,
    isLastStep,
    allValues,
    goToStep,
    goToPrevious,
    goToNext,
    progress: ((currentStep + 1) / steps.length) * 100,
  };
}
