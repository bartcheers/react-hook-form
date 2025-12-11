import { type ReactNode } from 'react';

import type {
  FieldValues,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormState } from './useFormState';

export type FormStateSubscribeProps<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
> = UseFormStateProps<TFieldValues, TTransformedValues> & {
  render: (formState: UseFormStateReturn<TFieldValues>) => ReactNode;
};

/**
 * FormStateSubscribe component that subscribes to form state changes and re-renders when the form state updates.
 * Provides the same functionality as useFormState, but in component form with a render prop.
 *
 * @param control - The form control object from useForm (optional if using FormProvider)
 * @param name - Field name(s) to subscribe to for form state changes
 * @param disabled - Option to disable the subscription
 * @param exact - Enable exact match for input name subscriptions
 * @param render - Function that receives form state and returns ReactNode
 * @returns The result of calling render function with form state
 *
 * @example
 * Re-render only when form state of `foo` changes:
 *
 * ```tsx
 * const { register, control } = useForm();
 *
 * <FormStateSubscribe
 *   control={control}
 *   name="foo"
 *   render={({ errors }) => <span>{errors.foo?.message}</span>}
 * />
 * ```
 */
export const FormStateSubscribe = <
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  disabled,
  exact,
  render,
}: FormStateSubscribeProps<TFieldValues, TTransformedValues>) =>
  render(useFormState({ control, name, disabled, exact }));
