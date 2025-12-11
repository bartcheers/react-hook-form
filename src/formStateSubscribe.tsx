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
 * FormStateSubscribe component that subscribes to form state changes and re-renders when state updates.
 *
 * @param control - The form control object from useForm (optional if using FormProvider)
 * @param name - Field name(s) to subscribe to for state changes
 * @param exact - Enable exact match for input name subscriptions
 * @param disabled - Option to disable the subscription
 * @param render - The function that receives form state and returns ReactNode
 * @returns The result of calling render function with form state
 *
 * @example
 * The `FormStateSubscribe` component only re-renders when the form state of the specified field(s) changes.
 * This allows you to declaratively consume form state in JSX without manually wiring up state.
 *
 * ```tsx
 * const { control, register } = useForm();
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
  disabled,
  name,
  exact,
  render,
}: FormStateSubscribeProps<TFieldValues, TTransformedValues>) =>
  render(useFormState({ control, disabled, name, exact }));
