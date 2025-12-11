import React from 'react';
import { FormStateSubscribe, useForm } from 'react-hook-form';

let renderCounter = 0;

type FormInputs = {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
};

export const FormStateSubscribeExample: React.FC = () => {
  const { register, handleSubmit, control } = useForm<FormInputs>({
    mode: 'onChange',
  });
  const onValid = () => {};

  renderCounter++;

  return (
    <div>
      <h1>FormStateSubscribe Example</h1>
      <p>
        This example demonstrates the FormStateSubscribe component which
        subscribes to specific field state changes without re-rendering the
        entire form.
      </p>
      <form onSubmit={handleSubmit(onValid)}>
        <div>
          <input
            {...register('firstName', { required: 'First name is required' })}
            placeholder="First Name"
          />
          {/* Only re-renders when firstName state changes */}
          <FormStateSubscribe
            control={control}
            name="firstName"
            render={({ errors, touchedFields, dirtyFields }) => (
              <div id="firstNameState" style={{ color: 'red', minHeight: 20 }}>
                {errors.firstName?.message}
                {touchedFields.firstName && ' (touched)'}
                {dirtyFields.firstName && ' (dirty)'}
              </div>
            )}
          />
        </div>

        <div>
          <input
            {...register('lastName', {
              required: 'Last name is required',
              minLength: { value: 2, message: 'Min length is 2' },
            })}
            placeholder="Last Name"
          />
          {/* Only re-renders when lastName state changes */}
          <FormStateSubscribe
            control={control}
            name="lastName"
            render={({ errors, touchedFields, dirtyFields }) => (
              <div id="lastNameState" style={{ color: 'red', minHeight: 20 }}>
                {errors.lastName?.message}
                {touchedFields.lastName && ' (touched)'}
                {dirtyFields.lastName && ' (dirty)'}
              </div>
            )}
          />
        </div>

        <div>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            placeholder="Email"
          />
          <FormStateSubscribe
            control={control}
            name="email"
            render={({ errors, touchedFields }) => (
              <div id="emailState" style={{ color: 'red', minHeight: 20 }}>
                {errors.email?.message}
                {touchedFields.email && ' (touched)'}
              </div>
            )}
          />
        </div>

        <div>
          <input
            type="number"
            {...register('age', {
              min: { value: 18, message: 'Must be 18 or older' },
              max: { value: 100, message: 'Must be 100 or younger' },
            })}
            placeholder="Age"
          />
          <FormStateSubscribe
            control={control}
            name="age"
            render={({ errors }) => (
              <div id="ageState" style={{ color: 'red', minHeight: 20 }}>
                {errors.age?.message}
              </div>
            )}
          />
        </div>

        {/* Subscribe to all form state */}
        <FormStateSubscribe
          control={control}
          render={({ isDirty, isValid, errors }) => (
            <div id="formState" style={{ marginTop: 20 }}>
              <p>
                <strong>Overall Form State:</strong>
              </p>
              <p>Is Dirty: {isDirty ? 'Yes' : 'No'}</p>
              <p>Is Valid: {isValid ? 'Yes' : 'No'}</p>
              <p>Error Count: {Object.keys(errors).length}</p>
            </div>
          )}
        />

        <button id="submit" type="submit" style={{ marginTop: 20 }}>
          Submit
        </button>
      </form>

      <div id="renderCount" style={{ marginTop: 20 }}>
        Main Form Render Count: {renderCounter}
      </div>
    </div>
  );
};
