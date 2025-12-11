import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { FormStateSubscribe } from '../formStateSubscribe';
import { useForm } from '../useForm';

type FormType = {
  foo: string;
  bar: string;
};

describe('FormStateSubscribe', () => {
  it('should pass form state to render function', () => {
    const Component = () => {
      const { control, register } = useForm<FormType>({
        mode: 'onChange',
      });
      return (
        <form>
          <input data-testid="foo" {...register('foo', { required: true })} />
          <FormStateSubscribe
            control={control}
            render={({ errors }) => (
              <span data-testid="error">
                {errors.foo ? 'error' : 'no error'}
              </span>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const errorText = screen.getByTestId('error');

    expect(errorText).toHaveTextContent('no error');

    fireEvent.input(fooInput, { target: { value: 'test' } });
    expect(errorText).toHaveTextContent('no error');

    fireEvent.input(fooInput, { target: { value: '' } });
    expect(errorText).toHaveTextContent('error');
  });

  it('should trigger re-render only when subscribed form state changes', () => {
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

    fireEvent.input(fooInput, { target: { value: 'a' } });
    expect(outerCallback).toHaveBeenCalledTimes(2);
    expect(fooCallback).toHaveBeenCalledTimes(3);
    expect(barCallback).toHaveBeenCalledTimes(2);

    fireEvent.input(barInput, { target: { value: 'b' } });
    expect(outerCallback).toHaveBeenCalledTimes(2);
    expect(fooCallback).toHaveBeenCalledTimes(3);
    expect(barCallback).toHaveBeenCalledTimes(3);
  });

  it('should support disabled prop to disable subscription', () => {
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
            disabled={true}
            render={() => <OnRender callback={callback} />}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');

    const initialCallCount = callback.mock.calls.length;
    fireEvent.input(fooInput, { target: { value: 'test' } });
    expect(callback).toHaveBeenCalledTimes(initialCallCount);
  });

  it('should render form state with isDirty, dirtyFields, and touchedFields', () => {
    const Component = () => {
      const { control, register } = useForm<FormType>();
      return (
        <form>
          <input data-testid="foo" {...register('foo')} />
          <FormStateSubscribe
            control={control}
            render={({ isDirty, dirtyFields, touchedFields }) => (
              <>
                <div data-testid="isDirty">{isDirty ? 'dirty' : 'clean'}</div>
                <div data-testid="dirtyFields">
                  {dirtyFields.foo ? 'foo dirty' : 'foo clean'}
                </div>
                <div data-testid="touchedFields">
                  {touchedFields.foo ? 'foo touched' : 'foo untouched'}
                </div>
              </>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const isDirtyText = screen.getByTestId('isDirty');
    const dirtyFieldsText = screen.getByTestId('dirtyFields');
    const touchedFieldsText = screen.getByTestId('touchedFields');

    expect(isDirtyText).toHaveTextContent('clean');
    expect(dirtyFieldsText).toHaveTextContent('foo clean');
    expect(touchedFieldsText).toHaveTextContent('foo untouched');

    fireEvent.input(fooInput, { target: { value: 'test' } });
    expect(isDirtyText).toHaveTextContent('dirty');
    expect(dirtyFieldsText).toHaveTextContent('foo dirty');

    fireEvent.blur(fooInput);
    expect(touchedFieldsText).toHaveTextContent('foo touched');
  });
});
