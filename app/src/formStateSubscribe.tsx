import React from 'react';
import { useForm, FormStateSubscribe } from 'react-hook-form';

let renderCounter = 0;

const FormStateSubscribeExample = () => {
  const { register, control, handleSubmit } = useForm<{
    firstName: string;
    lastName: string;
    email: string;
  }>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  renderCounter++;

  return (
    <div>
      <h1>FormStateSubscribe Example</h1>
      <p>
        The FormStateSubscribe component allows you to subscribe to form state
        changes without causing the parent component to re-render.
      </p>

      <form
        onSubmit={handleSubmit((d) => {
          console.log(d);
        })}
      >
        <div style={{ marginBottom: '1rem' }}>
          <input
            {...register('firstName', { required: 'First name is required' })}
            placeholder="First Name"
            style={{ padding: '0.5rem', marginRight: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            {...register('lastName', { required: 'Last name is required' })}
            placeholder="Last Name"
            style={{ padding: '0.5rem', marginRight: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            placeholder="Email"
            style={{ padding: '0.5rem', marginRight: '0.5rem' }}
          />
        </div>

        {/* Subscribe to firstName errors only */}
        <FormStateSubscribe
          control={control}
          name="firstName"
          render={({ errors }) => (
            <div
              id="firstNameError"
              style={{ color: 'red', marginBottom: '1rem' }}
            >
              {errors.firstName?.message || ''}
            </div>
          )}
        />

        {/* Subscribe to lastName errors only */}
        <FormStateSubscribe
          control={control}
          name="lastName"
          render={({ errors }) => (
            <div
              id="lastNameError"
              style={{ color: 'red', marginBottom: '1rem' }}
            >
              {errors.lastName?.message || ''}
            </div>
          )}
        />

        {/* Subscribe to email errors only */}
        <FormStateSubscribe
          control={control}
          name="email"
          render={({ errors }) => (
            <div id="emailError" style={{ color: 'red', marginBottom: '1rem' }}>
              {errors.email?.message || ''}
            </div>
          )}
        />

        {/* Subscribe to entire form state */}
        <FormStateSubscribe
          control={control}
          render={({ isDirty, isValid, errors }) => (
            <div id="formState" style={{ marginBottom: '1rem' }}>
              <h3>Form State:</h3>
              <pre>
                {JSON.stringify(
                  {
                    isDirty,
                    isValid,
                    errorCount: Object.keys(errors).length,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
        />

        <button
          id="submit"
          type="submit"
          style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}
        >
          Submit
        </button>

        <div
          id="renderCount"
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f0f0f0',
          }}
        >
          Parent component render count: {renderCounter}
        </div>
      </form>
    </div>
  );
};

export default FormStateSubscribeExample;
