import * as React from 'react';

import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockData } from '@tests/mockData';
import { render as renderRTL, screen, waitFor } from '@tests/utils';
import { useLocation } from 'react-router-dom';

import { HistoryProvider } from '../../pages/History';
import { mockHistoryVersionsData } from '../../tests/mockData';
import { VersionsList } from '../VersionsList';

const user = userEvent.setup();

const LocationDisplay = () => {
  const location = useLocation();

  return <span data-testid="location">{location.search}</span>;
};

const render = (ui: React.ReactElement) =>
  renderRTL(ui, {
    renderOptions: {
      wrapper({ children }) {
        return (
          <>
            {children}
            <LocationDisplay />
          </>
        );
      },
    },
  });

describe('VersionsList', () => {
  it('renders a list of history versions', async () => {
    render(
      <HistoryProvider
        page={1}
        contentType="api::kitchensink.kitchensink"
        // @ts-expect-error – we don't need to bother formatting the layout
        layout={mockData.contentManager.collectionTypeConfiguration}
        versions={mockHistoryVersionsData.historyVersions}
        selectedVersion={mockHistoryVersionsData.historyVersions.data[0]}
      >
        <VersionsList />
      </HistoryProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    // Shows sidebar header and total count
    const header = screen.getByRole('banner');
    expect(within(header).getByText('Versions')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Versions')).toBeInTheDocument();

    // Displays the right info for each version
    const versions = screen.getAllByRole('link');
    expect(within(versions[0]).getByText(/current/i)).toBeInTheDocument();
    expect(within(versions[1]).queryByText(/current/i)).not.toBeInTheDocument();
    expect(within(versions[1]).getByText(/draft/i)).toBeInTheDocument();
    expect(within(versions[1]).getByText(/by/i)).toBeInTheDocument();
    expect(within(versions[1]).getByText('1/31/2024, 03:58 PM')).toBeInTheDocument();
    expect(within(versions[1]).getByText(/by Kai Doe/i)).toBeInTheDocument();

    // Redirects to 2nd version on click
    await user.click(versions[1]);
    expect(screen.queryByText('?id=26')).not.toBeInTheDocument();
    expect(screen.getByText('?id=25')).toBeInTheDocument();

    // Redirects to 1st version again on click
    await user.click(versions[0]);
    expect(screen.queryByText('?id=25')).not.toBeInTheDocument();
    expect(screen.getByText('?id=26')).toBeInTheDocument();
  });
});
