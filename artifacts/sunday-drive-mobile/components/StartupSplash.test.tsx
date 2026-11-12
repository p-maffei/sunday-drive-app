import { act, fireEvent, render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import StartupSplash from './StartupSplash';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('StartupSplash', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('waits for its image, holds for five seconds, then fades out', async () => {
    jest.useFakeTimers();
    const onFinished = jest.fn();
    const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
      start: (callback) => callback?.({ finished: true }),
      stop: jest.fn(),
      reset: jest.fn(),
    });

    const screen = await render(
      <StartupSplash displayDurationMs={5000} onFinished={onFinished} />,
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(timing).not.toHaveBeenCalled();

    await fireEvent(await screen.getByTestId('startup-splash-image'), 'loadEnd');
    await act(async () => {
      jest.advanceTimersByTime(150);
    });
    expect(await screen.getByText('..')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(150);
    });
    expect(await screen.getByText('...')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(4699);
    });
    expect(timing).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(timing).toHaveBeenCalled();
    expect(onFinished).toHaveBeenCalledTimes(1);
  });
});
