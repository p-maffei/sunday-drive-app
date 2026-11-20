import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import DrivePlannerScreen from './DrivePlannerScreen';

const mockRouter = { push: jest.fn() };
const mockSetGeneratedDrive = jest.fn();
const mockSuggestion = {
  id: 'place-1',
  label: 'Pasadena, California',
  title: 'Pasadena',
  context: 'California',
  latitude: 34.1478,
  longitude: -118.1445,
};

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@workspace/api-client-react', () => ({
  useGetGeocodingSuggestions: ({ q }: { q: string }) => ({
    data: q ? { suggestions: [mockSuggestion] } : undefined,
    isFetching: false,
    isError: false,
  }),
  setBaseUrl: jest.fn(),
}));

jest.mock('./RouteResultContext', () => ({
  useRouteResult: () => ({ setGeneratedDrive: mockSetGeneratedDrive }),
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
    mockSetGeneratedDrive.mockClear();
    jest.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const isFastest = String(input).endsWith('/fastest');
      return {
        ok: true,
        json: async () => isFastest
          ? {
              fastest_min: 28,
              distance_km: 28,
              scores: { curvy: 31, backroads: 17, urban: 42 },
              geojson: {
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: [[-118.1445, 34.1478], [-118.2437, 34.0522]],
                  },
                }],
              },
            }
          : {
              fastest: {
                duration_min: 28,
                distance_km: 28,
                scores: { curvy: 31, backroads: 17, urban: 42 },
                geojson: {
                  type: 'FeatureCollection',
                  features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: [[-118.1445, 34.1478], [-118.2437, 34.0522]],
                    },
                  }],
                },
              },
              extra_min: 120,
              budget_min: 120,
              style: ['curvy', 'backroads'],
              style_defaulted: false,
              note: null,
              options: [{
                rank: 1,
                waypoint: null,
                distance_km: 30.5,
                duration_min: 39,
                extra_min: 11,
                match_pct: null,
                breakdown: { curvy: 21, backroads: 17, urban: 42 },
                fun_km: 20,
                reused_km: 0,
                geojson: {
                  type: 'FeatureCollection',
                  features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: [
                        [-118.1445, 34.1478],
                        [-118.2437, 34.0522],
                      ],
                    },
                  }],
                },
              }],
            },
      } as Response;
    });
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test';
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
      'Choose a starting location from the suggestions.',
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

  it('shows only supported preferences and keeps urban and backroads exclusive', async () => {
    const screen = await render(<DrivePlannerScreen />);
    expect(await screen.getByTestId('text-default-route-style')).toBeTruthy();
    const curvy = await screen.getByTestId('preference-curvy');
    const backroads = await screen.getByTestId('preference-backroads');
    const urban = await screen.getByTestId('preference-urban');
    expect(await screen.getAllByTestId(/^preference-/)).toHaveLength(3);

    await fireEvent.press(curvy);
    expect(await screen.queryByTestId('text-default-route-style')).toBeNull();
    await fireEvent.press(backroads);
    expect(curvy.props.accessibilityState).toEqual({ checked: true });
    expect(backroads.props.accessibilityState).toEqual({ checked: true });

    await fireEvent.press(urban);
    expect(curvy.props.accessibilityState).toEqual({ checked: true });
    expect(backroads.props.accessibilityState).toEqual({ checked: false });
    expect(urban.props.accessibilityState).toEqual({ checked: true });

    await fireEvent.press(backroads);
    expect(backroads.props.accessibilityState).toEqual({ checked: true });
    expect(urban.props.accessibilityState).toEqual({ checked: false });

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

  it('keeps the optional destination compatible with Round trip and I’ll Go Anywhere', async () => {
    const screen = await render(<DrivePlannerScreen />);
    const destination = await screen.getByTestId('input-destination');

    await fireEvent.changeText(destination, 'Santa Barbara');
    await fireEvent.press(await screen.getByTestId('toggle-anywhere'));
    expect((await screen.getByTestId('input-destination')).props.value).toBe('');
    expect((await screen.getByTestId('input-destination')).props.editable).toBe(
      false,
    );

    const roundTrip = await screen.getByTestId('toggle-round-trip');
    await fireEvent.press(roundTrip);
    expect(roundTrip.props.accessibilityState).toEqual({ checked: true });

    await fireEvent.press(await screen.getByTestId('toggle-anywhere'));
    expect((await screen.getByTestId('input-destination')).props.editable).toBe(
      true,
    );
  });

  it('sends geocoded coordinates and supported preferences, then opens route results', async () => {
    const screen = await render(<DrivePlannerScreen />);

    await fireEvent(await screen.getByTestId('input-start-location'), 'focus');
    await fireEvent.changeText(
      await screen.getByTestId('input-start-location'),
      'Pasadena, CA',
    );
    await fireEvent.press(
      await screen.findByTestId('input-start-location-suggestion-place-1'),
    );

    await fireEvent(await screen.getByTestId('input-destination'), 'focus');
    await fireEvent.changeText(
      await screen.getByTestId('input-destination'),
      'Santa Monica',
    );
    await fireEvent.press(
      await screen.findByTestId('input-destination-suggestion-place-1'),
    );

    await fireEvent.press(await screen.getByTestId('preference-curvy'));
    await fireEvent.press(await screen.getByTestId('preference-backroads'));
    await fireEvent.press(await screen.getByTestId('preference-urban'));
    await fireEvent.press(await screen.getByTestId('button-find-drive'));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/wander',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          start: [-118.1445, 34.1478],
          end: [-118.1445, 34.1478],
          extra_min: 120,
          preferences: ['curvy', 'urban'],
          strength: 7,
        }),
      }),
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.test/fastest',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          start: [-118.1445, 34.1478],
          end: [-118.1445, 34.1478],
        }),
      }),
    );
    expect(
      jest.mocked(globalThis.fetch).mock.calls.filter(([url]) =>
        String(url).endsWith('/fastest'),
      ),
    ).toHaveLength(1);
    expect(mockSetGeneratedDrive).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([
          expect.objectContaining({
            distance_km: 30.5,
            duration_min: 39,
            match_pct: null,
          }),
        ]),
        selectedOptionRank: 1,
      }),
    );
    expect(mockRouter.push).toHaveBeenCalledWith('/discovery');
    expect(await screen.queryByTestId('error-drive-form')).toBeNull();
  });

  it('shows the API detail when route generation returns an error', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        detail: 'Point is outside the loaded area.',
      }),
    } as Response);
    const screen = await render(<DrivePlannerScreen />);

    await fireEvent(await screen.getByTestId('input-start-location'), 'focus');
    await fireEvent.changeText(
      await screen.getByTestId('input-start-location'),
      'Pasadena, CA',
    );
    await fireEvent.press(
      await screen.findByTestId('input-start-location-suggestion-place-1'),
    );
    await fireEvent(await screen.getByTestId('input-destination'), 'focus');
    await fireEvent.changeText(
      await screen.getByTestId('input-destination'),
      'Santa Monica',
    );
    await fireEvent.press(
      await screen.findByTestId('input-destination-suggestion-place-1'),
    );
    await fireEvent.press(await screen.getByTestId('button-find-drive'));

    expect(
      (await screen.findByTestId('error-drive-form')).props.children,
    ).toBe('Point is outside the loaded area.');
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('shows friendly guidance when the wander API times out', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 504,
      json: async () => ({ detail: 'Gateway timeout' }),
    } as Response);
    const screen = await render(<DrivePlannerScreen />);

    await fireEvent(await screen.getByTestId('input-start-location'), 'focus');
    await fireEvent.changeText(
      await screen.getByTestId('input-start-location'),
      'Pasadena, CA',
    );
    await fireEvent.press(
      await screen.findByTestId('input-start-location-suggestion-place-1'),
    );
    await fireEvent(await screen.getByTestId('input-destination'), 'focus');
    await fireEvent.changeText(
      await screen.getByTestId('input-destination'),
      'Santa Monica',
    );
    await fireEvent.press(
      await screen.findByTestId('input-destination-suggestion-place-1'),
    );
    await fireEvent.press(await screen.getByTestId('button-find-drive'));

    expect(
      await screen.findByText('That took too long, try a shorter time'),
    ).toBeTruthy();
  });
});
