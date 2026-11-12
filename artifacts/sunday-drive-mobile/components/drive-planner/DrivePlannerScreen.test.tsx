import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import DrivePlannerScreen from './DrivePlannerScreen';

const mockRouter = { push: jest.fn() };

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@expo-google-fonts/michroma', () => ({
  Michroma_400Regular: {},
  useFonts: () => [true, null],
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('@/components/KeyboardAwareScrollViewCompat', () => {
  const { ScrollView } = require('react-native');
  return { KeyboardAwareScrollViewCompat: ScrollView };
});

describe('drive planner behavior', () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
    jest
      .mocked(useRouter)
      .mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
  });

  it('shows the required starting-location message and stays on the planner when blank', async () => {
    const screen = await render(<DrivePlannerScreen />);

    await fireEvent.changeText(
      await screen.getByTestId('input-start-location'),
      '   ',
    );
    await fireEvent.press(await screen.getByTestId('button-find-drive'));

    expect((await screen.getByTestId('error-drive-form')).props.children).toBe(
      'Add a starting location to continue.',
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('rejects invalid vehicle details, then adds and selects valid details', async () => {
    const screen = await render(<DrivePlannerScreen />);

    await fireEvent.press(await screen.getByTestId('button-toggle-add-vehicle'));
    await fireEvent.changeText(await screen.getByTestId('vehicle-year'), '1885');
    await fireEvent.changeText(await screen.getByTestId('vehicle-make'), 'Toyota');
    await fireEvent.changeText(await screen.getByTestId('vehicle-model'), 'Prius');
    await fireEvent.press(await screen.getByTestId('button-save-vehicle'));

    expect(
      await screen.getByText('Enter a valid year, make, and model.'),
    ).toBeTruthy();
    expect(await screen.queryByTestId(/^vehicle-option-/)).toBeNull();

    await fireEvent.changeText(
      await screen.getByTestId('vehicle-year'),
      String(new Date().getFullYear()),
    );
    await fireEvent.press(await screen.getByTestId('button-save-vehicle'));

    const addedVehicle = await screen.getByTestId(/^vehicle-option-/);
    expect(addedVehicle.props.accessibilityState).toEqual({ selected: true });
    expect(
      await screen.queryByText('Enter a valid year, make, and model.'),
    ).toBeNull();
  });

  it('lets users toggle route preferences and choose a different vehicle', async () => {
    const screen = await render(<DrivePlannerScreen />);
    const scenicRoads = await screen.getByTestId('preference-scenic-roads');

    await fireEvent.press(scenicRoads);
    expect(scenicRoads.props.accessibilityState).toEqual({ checked: true });
    await fireEvent.press(scenicRoads);
    expect(scenicRoads.props.accessibilityState).toEqual({ checked: false });

    await fireEvent.press(await screen.getByTestId('button-toggle-add-vehicle'));
    await fireEvent.changeText(await screen.getByTestId('vehicle-year'), '2020');
    await fireEvent.changeText(await screen.getByTestId('vehicle-make'), 'Toyota');
    await fireEvent.changeText(await screen.getByTestId('vehicle-model'), 'Prius');
    await fireEvent.press(await screen.getByTestId('button-save-vehicle'));

    await fireEvent.press(await screen.getByTestId('button-toggle-add-vehicle'));
    await fireEvent.press(await screen.getByTestId('button-toggle-add-vehicle'));
    await fireEvent.changeText(await screen.getByTestId('vehicle-year'), '2022');
    await fireEvent.changeText(await screen.getByTestId('vehicle-make'), 'Honda');
    await fireEvent.changeText(await screen.getByTestId('vehicle-model'), 'Civic');
    await fireEvent.press(await screen.getByTestId('button-save-vehicle'));

    const vehicleOptions = await screen.getAllByTestId(/^vehicle-option-/);
    expect(vehicleOptions[0].props.accessibilityState).toEqual({
      selected: false,
    });
    expect(vehicleOptions[1].props.accessibilityState).toEqual({
      selected: true,
    });

    await fireEvent.press(vehicleOptions[0]);
    const updatedVehicleOptions = await screen.getAllByTestId(
      /^vehicle-option-/,
    );
    expect(updatedVehicleOptions[0].props.accessibilityState).toEqual({
      selected: true,
    });
    expect(updatedVehicleOptions[1].props.accessibilityState).toEqual({
      selected: false,
    });
  });

  it('routes to discovery after a starting location is provided', async () => {
    const screen = await render(<DrivePlannerScreen />);

    await fireEvent.changeText(
      await screen.getByTestId('input-start-location'),
      'Pasadena, CA',
    );
    await fireEvent.press(await screen.getByTestId('button-find-drive'));

    expect(mockRouter.push).toHaveBeenCalledWith('/discovery');
    expect(await screen.queryByTestId('error-drive-form')).toBeNull();
  });
});
