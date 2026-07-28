import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ProgressTab from '../../../app/(tabs)/progress';

const mockUseLocalSearchParams = jest.fn();
const mockSetParams = jest.fn();
const mockUseEmptiesArchive = jest.fn();
const mockUseProducts = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({ setParams: mockSetParams }),
}));

jest.mock('../FinishFlow', () => {
  const { Pressable, Text, View } = jest.requireActual('react-native');

  return {
    FinishFlow: ({
      productId,
      onCancel,
      onComplete,
    }: {
      productId: string;
      onCancel?: () => void;
      onComplete?: () => void;
    }) => (
      <View>
        <Text>{`Finish flow for ${productId}`}</Text>
        <Pressable accessibilityLabel="Complete test finish" onPress={onComplete} />
        <Pressable accessibilityLabel="Cancel test finish" onPress={onCancel} />
      </View>
    ),
  };
});

jest.mock('../ProgressSummary', () => {
  const { Text } = jest.requireActual('react-native');

  return { ProgressSummary: () => <Text>Progress summary</Text> };
});

jest.mock('../EmptiesArchive', () => {
  const { Text } = jest.requireActual('react-native');

  return { EmptiesArchive: () => <Text>Private archive</Text> };
});

jest.mock('../EmptiesEmptyState', () => {
  const { Text } = jest.requireActual('react-native');

  return { EmptiesEmptyState: () => <Text>Empty archive</Text> };
});

jest.mock('../useEmptiesArchive', () => ({
  useEmptiesArchive: () => mockUseEmptiesArchive(),
}));

jest.mock('../../../lib/api', () => ({
  useProducts: () => mockUseProducts(),
}));

describe('ProgressTab finish seam', () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReset().mockReturnValue({});
    mockSetParams.mockReset();
    mockUseEmptiesArchive.mockReturnValue({
      entries: [],
      dashboard: {},
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseProducts.mockReturnValue({ data: [] });
  });

  it('opens FinishFlow from the finishProductId route param and clears it on completion', () => {
    mockUseLocalSearchParams.mockReturnValue({ finishProductId: ['product-1'] });
    const { getByLabelText, getByText } = render(<ProgressTab />);

    expect(getByText('Finish flow for product-1')).toBeTruthy();
    fireEvent.press(getByLabelText('Complete test finish'));

    expect(mockSetParams).toHaveBeenCalledWith({ finishProductId: undefined });
  });

  it('clears the finishProductId route param when the finish is cancelled', () => {
    mockUseLocalSearchParams.mockReturnValue({ finishProductId: 'product-1' });
    const { getByLabelText } = render(<ProgressTab />);

    fireEvent.press(getByLabelText('Cancel test finish'));

    expect(mockSetParams).toHaveBeenCalledWith({ finishProductId: undefined });
  });

  it('renders the archive when there is no finishProductId route param', () => {
    const { getByText, queryByText } = render(<ProgressTab />);

    expect(getByText('Progress summary')).toBeTruthy();
    expect(getByText('Empty archive')).toBeTruthy();
    expect(queryByText(/Finish flow for/)).toBeNull();
  });
});
