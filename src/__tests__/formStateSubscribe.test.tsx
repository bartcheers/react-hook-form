import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

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
  it('should pass the form state to render function', () => {
    const Component = () => {
      const { control, register } = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <form>
          <input data-testid="foo" {...register('foo', { required: true })} />
          <input data-testid="bar" {...register('bar', { required: true })} />
          <FormStateSubscribe
            control={control}
            name="foo"
            render={({ errors }) => (
              <span data-testid="fooError">
                {errors.foo ? 'foo error' : 'no error'}
              </span>
            )}
          />
          <FormStateSubscribe
            control={control}
            name="bar"
            render={({ errors }) => (
              <span data-testid="barError">
                {errors.bar ? 'bar error' : 'no error'}
              </span>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const barInput = screen.getByTestId('bar');
    const fooError = screen.getByTestId('fooError');
    const barError = screen.getByTestId('barError');

    // Initially no errors
    expect(fooError).toHaveTextContent('no error');
    expect(barError).toHaveTextContent('no error');

    // Trigger validation by changing and clearing
    fireEvent.input(fooInput, { target: { value: 'a' } });
    fireEvent.input(fooInput, { target: { value: '' } });
    fireEvent.blur(fooInput);

    expect(fooError).toHaveTextContent('foo error');
    expect(barError).toHaveTextContent('no error');

    fireEvent.input(barInput, { target: { value: 'b' } });
    fireEvent.input(barInput, { target: { value: '' } });
    fireEvent.blur(barInput);

    expect(fooError).toHaveTextContent('foo error');
    expect(barError).toHaveTextContent('bar error');
  });

  it('should trigger re-render only when the subscribed field state changes', () => {
    const outerCallback = jest.fn();
    const fooCallback = jest.fn();
    const barCallback = jest.fn();

    const OnRender = ({ callback }: { callback: () => void }) => {
      callback();
      return null;
    };

    const Component = () => {
      const { control, register } = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <form>
          <input data-testid="foo" {...register('foo', { required: true })} />
          <input data-testid="bar" {...register('bar', { required: true })} />
          <OnRender callback={outerCallback} />
          <FormStateSubscribe
            control={control}
            name="foo"
            render={() => <OnRender callback={fooCallback} />}
          />
          <FormStateSubscribe
            control={control}
            name="bar"
            render={() => <OnRender callback={barCallback} />}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const barInput = screen.getByTestId('bar');

    const initialOuterCalls = outerCallback.mock.calls.length;
    const initialFooCalls = fooCallback.mock.calls.length;
    const initialBarCalls = barCallback.mock.calls.length;

    // Change foo
    fireEvent.input(fooInput, { target: { value: 'a' } });
    expect(outerCallback).toHaveBeenCalledTimes(initialOuterCalls);
    expect(fooCallback.mock.calls.length).toBeGreaterThan(initialFooCalls);
    expect(barCallback).toHaveBeenCalledTimes(initialBarCalls);

    const afterFooOuterCalls = outerCallback.mock.calls.length;
    const afterFooFooCalls = fooCallback.mock.calls.length;
    const afterFooBarCalls = barCallback.mock.calls.length;

    // Change bar
    fireEvent.input(barInput, { target: { value: 'b' } });
    expect(outerCallback).toHaveBeenCalledTimes(afterFooOuterCalls);
    expect(fooCallback).toHaveBeenCalledTimes(afterFooFooCalls);
    expect(barCallback.mock.calls.length).toBeGreaterThan(afterFooBarCalls);
  });

  it('should not trigger re-render when disabled is true', () => {
    const callback = jest.fn();

    const OnRender = ({ callback }: { callback: () => void }) => {
      callback();
      return null;
    };

    const Component = () => {
      const { control, register } = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <form>
          <input data-testid="foo" {...register('foo')} />
          <FormStateSubscribe
            control={control}
            name="foo"
            disabled={true}
            render={() => <OnRender callback={callback} />}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const initialCalls = callback.mock.calls.length;

    fireEvent.input(fooInput, { target: { value: 'a' } });
    // Should not trigger additional renders when disabled
    expect(callback).toHaveBeenCalledTimes(initialCalls);
  });

  it('should work without control prop when using FormProvider', () => {
    const Component = () => {
      const methods = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <FormProvider {...methods}>
          <form>
            <input
              data-testid="foo"
              {...methods.register('foo', { required: true })}
            />
            <FormStateSubscribe
              name="foo"
              render={({ errors }) => (
                <span data-testid="fooError">
                  {errors.foo ? 'foo error' : 'no error'}
                </span>
              )}
            />
          </form>
        </FormProvider>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const fooError = screen.getByTestId('fooError');

    expect(fooError).toHaveTextContent('no error');

    fireEvent.input(fooInput, { target: { value: 'a' } });
    fireEvent.input(fooInput, { target: { value: '' } });
    fireEvent.blur(fooInput);

    expect(fooError).toHaveTextContent('foo error');
  });

  it('should subscribe to multiple fields with array name prop', () => {
    const Component = () => {
      const { control, register } = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <form>
          <input data-testid="foo" {...register('foo', { required: true })} />
          <input data-testid="bar" {...register('bar', { required: true })} />
          <FormStateSubscribe
            control={control}
            name={['foo', 'bar']}
            render={({ errors }) => (
              <span data-testid="errors">
                {errors.foo && 'foo error, '}
                {errors.bar && 'bar error'}
              </span>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const barInput = screen.getByTestId('bar');
    const errors = screen.getByTestId('errors');

    fireEvent.input(fooInput, { target: { value: 'a' } });
    fireEvent.input(fooInput, { target: { value: '' } });
    fireEvent.blur(fooInput);

    expect(errors).toHaveTextContent('foo error');

    fireEvent.input(barInput, { target: { value: 'b' } });
    fireEvent.input(barInput, { target: { value: '' } });
    fireEvent.blur(barInput);

    expect(errors).toHaveTextContent('foo error, bar error');
  });

  it('should provide access to all form state properties', () => {
    const Component = () => {
      const { control, register } = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <form>
          <input data-testid="foo" {...register('foo', { required: true })} />
          <FormStateSubscribe
            control={control}
            name="foo"
            render={({ isDirty, isValid, errors, touchedFields }) => (
              <div>
                <span data-testid="isDirty">{isDirty ? 'dirty' : 'clean'}</span>
                <span data-testid="isValid">
                  {isValid ? 'valid' : 'invalid'}
                </span>
                <span data-testid="hasError">
                  {errors.foo ? 'error' : 'no error'}
                </span>
                <span data-testid="touched">
                  {touchedFields.foo ? 'touched' : 'not touched'}
                </span>
              </div>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');

    expect(screen.getByTestId('isDirty')).toHaveTextContent('clean');
    expect(screen.getByTestId('touched')).toHaveTextContent('not touched');

    fireEvent.input(fooInput, { target: { value: 'a' } });
    expect(screen.getByTestId('isDirty')).toHaveTextContent('dirty');

    fireEvent.blur(fooInput);
    expect(screen.getByTestId('touched')).toHaveTextContent('touched');
  });
});
