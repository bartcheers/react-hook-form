import { type ReactNode } from 'react';

import type { Control, FieldPath, FieldValues, FormState } from './types';
import { useFormState } from './useFormState';

export type FormStateSubscribeProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = {
  control?: Control<TFieldValues, TContext, TTransformedValues>;
  disabled?: boolean;
  name?:
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[];
  exact?: boolean;
  render: (formState: FormState<TFieldValues>) => ReactNode;
};

/**
 * FormStateSubscribe component that subscribes to form state changes and re-renders when form state updates.
 *
 * @param control - The form control object from useForm (optional if using FormProvider)
 * @param disabled - Option to disable the subscription
 * @param name - Subscribes to form state of specified form field(s)
 * @param exact - Enable exact match for input name subscriptions
 * @param render - The function that receives form state and returns ReactNode
 * @returns The result of calling render function with form state
 *
 * @example
 * Re-render only when form state of `foo` changes:
 *
 * ```tsx
 * const { control } = useForm();
 *
 * <FormStateSubscribe
 *   control={control}
 *   name="foo"
 *   render={({ errors }) => <span>{errors.foo?.message}</span>}
 * />
 * ```
 *
 * @example
 * Subscribe to multiple fields:
 *
 * ```tsx
 * const { control } = useForm();
 *
 * <FormStateSubscribe
 *   control={control}
 *   name={['foo', 'bar']}
 *   render={({ errors, isDirty }) => (
 *     <div>
 *       {errors.foo?.message}
 *       {errors.bar?.message}
 *       {isDirty && <p>Form is dirty</p>}
 *     </div>
 *   )}
 * />
 * ```
 */
export const FormStateSubscribe = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>({
  control,
  disabled,
  name,
  exact,
  render,
}: FormStateSubscribeProps<TFieldValues, TContext, TTransformedValues>) =>
  render(useFormState({ control, disabled, name, exact }));
