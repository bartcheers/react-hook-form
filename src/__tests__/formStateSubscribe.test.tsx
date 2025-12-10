import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { FormStateSubscribe } from '../formStateSubscribe';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';

type FormType = {
  foo: string;
  bar: string;
  baz: {
    qux: string;
  };
};

describe('FormStateSubscribe', () => {
  it('should render form state with errors and isDirty', async () => {
    const Component = () => {
      const { control, register } = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <form>
          <input
            data-testid="foo"
            {...register('foo', { required: 'This is required' })}
          />
          <input data-testid="bar" {...register('bar')} />
          <FormStateSubscribe
            control={control}
            render={({ errors, isDirty }) => (
              <div>
                <span data-testid="fooError">
                  {errors.foo?.message || 'no error'}
                </span>
                <span data-testid="isDirty">{isDirty ? 'dirty' : 'clean'}</span>
              </div>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const fooError = screen.getByTestId('fooError');
    const isDirtyText = screen.getByTestId('isDirty');

    expect(fooError).toHaveTextContent('no error');
    expect(isDirtyText).toHaveTextContent('clean');

    // Input a valid value first to make it dirty
    fireEvent.input(fooInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(isDirtyText).toHaveTextContent('dirty');
      expect(fooError).toHaveTextContent('no error');
    });

    // Clear the input to trigger validation error
    fireEvent.input(fooInput, { target: { value: '' } });

    await waitFor(() => {
      expect(fooError).toHaveTextContent('This is required');
    });
  });

  it('should trigger re-render when form state changes', async () => {
    const renderCallback = jest.fn();

    const OnRender = ({ callback }: { callback: () => void }) => {
      callback();
      return null;
    };

    const Component = () => {
      const { control, register } = useForm<FormType>();
      return (
        <form>
          <input data-testid="foo" {...register('foo')} />
          <input data-testid="bar" {...register('bar')} />
          <FormStateSubscribe
            control={control}
            render={({ isDirty }) => (
              <>
                <OnRender callback={renderCallback} />
                <span data-testid="isDirty">{isDirty ? 'dirty' : 'clean'}</span>
              </>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');

    const initialCallCount = renderCallback.mock.calls.length;

    // Change foo field - should trigger re-render
    fireEvent.input(fooInput, { target: { value: 'test' } });

    expect(screen.getByTestId('isDirty')).toHaveTextContent('dirty');
    expect(renderCallback.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('should work with FormProvider without passing control prop', () => {
    const Component = () => {
      const methods = useForm<FormType>();
      return (
        <FormProvider {...methods}>
          <form>
            <input
              data-testid="foo"
              {...methods.register('foo', { required: true })}
            />
            <FormStateSubscribe
              render={({ errors, isDirty }) => (
                <div>
                  <span data-testid="hasError">
                    {errors.foo ? 'has error' : 'no error'}
                  </span>
                  <span data-testid="isDirty">
                    {isDirty ? 'dirty' : 'clean'}
                  </span>
                </div>
              )}
            />
          </form>
        </FormProvider>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const hasError = screen.getByTestId('hasError');
    const isDirtyText = screen.getByTestId('isDirty');

    expect(hasError).toHaveTextContent('no error');
    expect(isDirtyText).toHaveTextContent('clean');

    fireEvent.input(fooInput, { target: { value: 'test' } });

    expect(isDirtyText).toHaveTextContent('dirty');
  });

  it('should subscribe to multiple fields', async () => {
    const Component = () => {
      const { control, register } = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <form>
          <input
            data-testid="foo"
            {...register('foo', { required: 'Foo is required' })}
          />
          <input
            data-testid="bar"
            {...register('bar', { required: 'Bar is required' })}
          />
          <input data-testid="baz" {...register('baz.qux')} />
          <FormStateSubscribe
            control={control}
            name={['foo', 'bar']}
            render={({ errors }) => (
              <div>
                <span data-testid="fooError">
                  {errors.foo?.message || 'no foo error'}
                </span>
                <span data-testid="barError">
                  {errors.bar?.message || 'no bar error'}
                </span>
              </div>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const barInput = screen.getByTestId('bar');

    // Input valid values first
    fireEvent.input(fooInput, { target: { value: 'test' } });
    await waitFor(() => {
      expect(screen.getByTestId('fooError')).toHaveTextContent('no foo error');
    });

    // Clear to trigger error
    fireEvent.input(fooInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByTestId('fooError')).toHaveTextContent(
        'Foo is required',
      );
    });

    // Input valid value in bar
    fireEvent.input(barInput, { target: { value: 'test' } });
    await waitFor(() => {
      expect(screen.getByTestId('barError')).toHaveTextContent('no bar error');
    });

    // Clear to trigger error
    fireEvent.input(barInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByTestId('barError')).toHaveTextContent(
        'Bar is required',
      );
    });
  });

  it('should respect disabled prop', async () => {
    const renderCallback = jest.fn();

    const OnRender = ({ callback }: { callback: () => void }) => {
      callback();
      return null;
    };

    const Component = () => {
      const { control, register } = useForm<FormType>();
      const [disabled, setDisabled] = React.useState(false);

      return (
        <form>
          <input data-testid="foo" {...register('foo')} />
          <button
            type="button"
            data-testid="toggle"
            onClick={() => setDisabled(!disabled)}
          >
            Toggle
          </button>
          <FormStateSubscribe
            control={control}
            disabled={disabled}
            render={({ isDirty }) => (
              <>
                <OnRender callback={renderCallback} />
                <span data-testid="isDirty">{isDirty ? 'dirty' : 'clean'}</span>
              </>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const toggleButton = screen.getByTestId('toggle');

    // Disable subscription
    fireEvent.click(toggleButton);

    const afterToggle = renderCallback.mock.calls.length;

    // Change foo field while disabled - should NOT trigger re-render
    fireEvent.input(fooInput, { target: { value: 'test' } });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(renderCallback).toHaveBeenCalledTimes(afterToggle);
  });

  it('should provide all form state properties', async () => {
    const Component = () => {
      const { control, register, handleSubmit } = useForm<FormType>({
        mode: 'onChange',
      });

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input data-testid="foo" {...register('foo', { required: true })} />
          <FormStateSubscribe
            control={control}
            render={(formState) => (
              <div>
                <span data-testid="isDirty">{String(formState.isDirty)}</span>
                <span data-testid="isValid">{String(formState.isValid)}</span>
                <span data-testid="isSubmitting">
                  {String(formState.isSubmitting)}
                </span>
                <span data-testid="isValidating">
                  {String(formState.isValidating)}
                </span>
                <span data-testid="isSubmitted">
                  {String(formState.isSubmitted)}
                </span>
                <span data-testid="submitCount">
                  {String(formState.submitCount)}
                </span>
              </div>
            )}
          />
          <button type="submit" data-testid="submit">
            Submit
          </button>
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const submitButton = screen.getByTestId('submit');

    // Initial state
    await waitFor(() => {
      expect(screen.getByTestId('isDirty')).toHaveTextContent('false');
      expect(screen.getByTestId('isValid')).toHaveTextContent('false');
      expect(screen.getByTestId('isSubmitted')).toHaveTextContent('false');
      expect(screen.getByTestId('submitCount')).toHaveTextContent('0');
    });

    // Make form dirty
    fireEvent.input(fooInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByTestId('isDirty')).toHaveTextContent('true');
      expect(screen.getByTestId('isValid')).toHaveTextContent('true');
    });

    // Submit form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('isSubmitted')).toHaveTextContent('true');
      expect(screen.getByTestId('submitCount')).toHaveTextContent('1');
    });
  });

  it('should respect exact prop for field subscriptions', () => {
    const Component = () => {
      const { control, register } = useForm<FormType>();

      return (
        <form>
          <input data-testid="foo" {...register('foo')} />
          <input data-testid="baz.qux" {...register('baz.qux')} />
          <FormStateSubscribe
            control={control}
            name="foo"
            exact={true}
            render={({ dirtyFields }) => (
              <div>
                <span data-testid="fooDirty">
                  {dirtyFields.foo ? 'foo is dirty' : 'foo is clean'}
                </span>
              </div>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');

    expect(screen.getByTestId('fooDirty')).toHaveTextContent('foo is clean');

    // Change foo field - should show as dirty
    fireEvent.input(fooInput, { target: { value: 'test' } });

    expect(screen.getByTestId('fooDirty')).toHaveTextContent('foo is dirty');
  });
});
