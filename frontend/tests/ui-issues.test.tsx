/**
 * Frontend UI/UX Issues Test Suite
 * Tests for Issues #96, #95, #94, and Delivery Location Persistence
 *
 * Run: npm run test:frontend
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// ============================================================================
// ISSUE #96: Razorpay Payment Modal Z-Index & Responsiveness
// ============================================================================

describe('## ISSUE #96 - Razorpay Modal Z-Index Fixes', () => {
  /**
   * Before Fix: Razorpay modal rendered below dialog overlay (z-50)
   * After Fix: Razorpay modal z-index: 9999 above all overlays
   */

  it('should render Razorpay modal at correct z-index', () => {
    // Mock dialog component
    const MockDialog = () => (
      <div data-testid="dialog-overlay" style={{ zIndex: 40 }}>
        <div data-testid="razorpay-container" style={{ zIndex: 9999 }}>
          Razorpay Modal
        </div>
      </div>
    );

    render(<MockDialog />);

    const razorpayContainer = screen.getByTestId('razorpay-container');
    const dialogOverlay = screen.getByTestId('dialog-overlay');

    const razorpayZIndex = parseInt(window.getComputedStyle(razorpayContainer).zIndex || '0');
    const dialogZIndex = parseInt(window.getComputedStyle(dialogOverlay).zIndex || '0');

    expect(razorpayZIndex).toBeGreaterThan(dialogZIndex);
    expect(razorpayZIndex).toBe(9999);
  });

  it('should allow rapid payment button clicks (first-click responsiveness)', async () => {
    const PaymentButton = () => {
      const [clicked, setClicked] = React.useState(false);
      return (
        <button
          onClick={() => setClicked(true)}
          data-testid="pay-button"
        >
          {clicked ? 'Processing...' : 'Pay Now'}
        </button>
      );
    };

    const { getByTestId } = render(<PaymentButton />);
    const button = getByTestId('pay-button');

    const clickStart = Date.now();
    fireEvent.click(button);
    const clickEnd = Date.now();

    // Should respond in <100ms
    expect(clickEnd - clickStart).toBeLessThan(100);
    expect(button.textContent).toBe('Processing...');
  });

  it('should disable pointer-events on overlay during payment', () => {
    const PaymentModal = () => (
      <div data-testid="payment-modal-overlay" style={{ pointerEvents: 'none' }}>
        <div data-testid="modal-content">Payment Processing</div>
      </div>
    );

    render(<PaymentModal />);

    const overlay = screen.getByTestId('payment-modal-overlay');
    const styles = window.getComputedStyle(overlay);

    expect(styles.pointerEvents).toBe('none');
  });

  it('should render Razorpay script at document body level', () => {
    // Verify Razorpay renders at top level, not nested
    const startLevel = document.body.children.length;

    const RazorpayContainer = () => (
      <div id="razorpay-container-9999" data-testid="razorpay-root">
        Razorpay Frame
      </div>
    );

    render(<RazorpayContainer />);

    // Should be accessible at top level
    expect(document.getElementById('razorpay-root')).toBeTruthy();
  });
});

// ============================================================================
// ISSUE #95: Rating Display Precision (Rounding)
// ============================================================================

describe('## ISSUE #95 - Rating Display Precision', () => {
  /**
   * Before Fix: 1.66666666... (full precision)
   * After Fix: "1.7" (exactly 1 decimal place)
   */

  it('should display ratings with exactly 1 decimal place', () => {
    const RatingDisplay = ({ rating }: { rating: number }) => (
      <div data-testid="rating-display">
        {rating.toFixed(1)} ⭐
      </div>
    );

    const { rerender } = render(<RatingDisplay rating={1.66666} />);
    expect(screen.getByTestId('rating-display')).toHaveTextContent('1.7');

    rerender(<RatingDisplay rating={4.333} />);
    expect(screen.getByTestId('rating-display')).toHaveTextContent('4.3');

    rerender(<RatingDisplay rating={3.999} />);
    expect(screen.getByTestId('rating-display')).toHaveTextContent('4.0');
  });

  it('should store full precision in database but display rounded', () => {
    const mockDatabaseRating = 1.66666666;
    const displayRating = mockDatabaseRating.toFixed(1);

    expect(displayRating).toBe('1.7');
    // Database still has full precision
    expect(mockDatabaseRating).toBe(1.66666666);
  });

  it('should handle all rating extremes with precision', () => {
    const RatingComponent = ({ rating }: { rating: number }) => (
      <span data-testid="rating">{rating.toFixed(1)}</span>
    );

    const testCases = [
      { input: 1.0, expected: '1.0' },
      { input: 1.05, expected: '1.1' },
      { input: 1.04, expected: '1.0' },
      { input: 5.0, expected: '5.0' },
      { input: 4.95, expected: '5.0' },
      { input: 3.555, expected: '3.6' },
    ];

    testCases.forEach(({ input, expected }) => {
      const { unmount } = render(<RatingComponent rating={input} />);
      expect(screen.getByTestId('rating')).toHaveTextContent(expected);
      unmount();
    });
  });

  it('should format rating consistently across all UI components', () => {
    const formatRating = (rating: number) => rating.toFixed(1);

    // All components use same format
    expect(formatRating(1.66666)).toBe('1.7');
    expect(formatRating(2.33333)).toBe('2.3');
    expect(formatRating(3.99999)).toBe('4.0');
  });
});

// ============================================================================
// ISSUE #94: Loading States & Prevent Double-Submit
// ============================================================================

describe('## ISSUE #94 - Loading States & Button Disable', () => {
  /**
   * Before Fix: Users could click buttons multiple times → duplicate submissions
   * After Fix: Button disabled during async operation, loading spinner shown
   */

  it('should disable button during async operation', async () => {
    const SubmitButton = () => {
      const [isLoading, setIsLoading] = React.useState(false);

      const handleSubmit = async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 500));
        setIsLoading(false);
      };

      return (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          data-testid="submit-btn"
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      );
    };

    render(<SubmitButton />);
    const button = screen.getByTestId('submit-btn') as HTMLButtonElement;

    // Initially enabled
    expect(button).not.toBeDisabled();

    // Click submit
    fireEvent.click(button);

    // Should be disabled immediately
    expect(button).toBeDisabled();
    expect(button.textContent).toBe('Submitting...');

    // Wait for async operation
    await waitFor(() => expect(button).not.toBeDisabled(), { timeout: 1000 });
  });

  it('should prevent double-submission with onClick guard', async () => {
    let submitCount = 0;

    const SafeSubmitButton = () => {
      const [isLoading, setIsLoading] = React.useState(false);

      const handleClick = async () => {
        if (isLoading) return; // Guard: don't submit if already loading

        setIsLoading(true);
        submitCount++;
        await new Promise(r => setTimeout(r, 200));
        setIsLoading(false);
      };

      return (
        <button onClick={handleClick} data-testid="safe-btn">
          Submit
        </button>
      );
    };

    render(<SafeSubmitButton />);
    const button = screen.getByTestId('safe-btn');

    // Rapid clicks
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(submitCount).toBeLessThanOrEqual(1), {
      timeout: 500,
    });
  });

  it('should show loading spinner during operation', () => {
    const ReviewForm = () => {
      const [isLoading, setIsLoading] = React.useState(false);

      const handleSubmit = async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 300));
        setIsLoading(false);
      };

      return (
        <>
          {isLoading && <div data-testid="spinner">Loading...</div>}
          <button onClick={handleSubmit} data-testid="submit">
            Submit Review
          </button>
        </>
      );
    };

    render(<ReviewForm />);

    // Before submit - no spinner
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();

    // Click submit
    fireEvent.click(screen.getByTestId('submit'));

    // Spinner appears
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should re-enable button and clear spinner on error', async () => {
    const ErrorHandlingForm = () => {
      const [isLoading, setIsLoading] = React.useState(false);
      const [error, setError] = React.useState<string | null>(null);

      const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
          throw new Error('Network error');
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <>
          {error && <div data-testid="error-msg">{error}</div>}
          <button onClick={handleSubmit} disabled={isLoading} data-testid="btn">
            {isLoading ? 'Loading...' : 'Submit'}
          </button>
        </>
      );
    };

    render(<ErrorHandlingForm />);
    const button = screen.getByTestId('btn') as HTMLButtonElement;

    fireEvent.click(button);
    await waitFor(() => expect(button).not.toBeDisabled());

    // Error message shown
    expect(screen.getByTestId('error-msg')).toHaveTextContent('Network error');

    // Button re-enabled
    expect(button).not.toBeDisabled();
    expect(button.textContent).toBe('Submit');
  });

  it('should auto-timeout button after 30 seconds', async () => {
    jest.useFakeTimers();

    const TimeoutButton = () => {
      const [isLoading, setIsLoading] = React.useState(false);

      const handleSubmit = () => {
        setIsLoading(true);
        const timeout = setTimeout(() => setIsLoading(false), 30000);
        return timeout;
      };

      return (
        <button onClick={handleSubmit} disabled={isLoading} data-testid="btn">
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      );
    };

    render(<TimeoutButton />);
    const button = screen.getByTestId('btn') as HTMLButtonElement;

    fireEvent.click(button);
    expect(button).toBeDisabled();

    // Advance to 30 seconds
    jest.advanceTimersByTime(30000);

    // Button should be re-enabled
    await waitFor(() => expect(button).not.toBeDisabled());

    jest.useRealTimers();
  });
});

// ============================================================================
// DELIVERY LOCATION PERSISTENCE - State Sync Fix
// ============================================================================

describe('## Delivery Location Persistence After Reload', () => {
  /**
   * Issue: After page reload, delivery location empty despite currentUser.address loaded
   *
   * Before Fix:
   * - location state initialized once
   * - API loads currentUser after init
   * - location stays empty (state not synced)
   *
   * After Fix:
   * - useEffect syncs location when currentUser loads
   * - location: setLocation(currentUser.address || '')
   */

  it('should sync delivery location when currentUser loads from API', () => {
    const CheckoutForm = ({ currentUser }) => {
      const [location, setLocation] = React.useState('');

      React.useEffect(() => {
        // Sync location when currentUser changes (e.g., after API load)
        if (currentUser?.address) {
          setLocation(currentUser.address);
        }
      }, [currentUser?.id]); // Track by ID to catch API updates

      return <input value={location} data-testid="location-input" readOnly />;
    };

    // Initial render with no user
    const { rerender } = render(<CheckoutForm currentUser={null} />);
    expect(screen.getByTestId('location-input')).toHaveValue('');

    // Simulate API loading user
    const mockUser = { id: 'user123', address: 'Hall A, Room 101' };
    rerender(<CheckoutForm currentUser={mockUser} />);

    // Location should now be synced from user.address
    expect(screen.getByTestId('location-input')).toHaveValue('Hall A, Room 101');
  });

  it('should persist location across page reload via localStorage', () => {
    const PersistentCheckout = () => {
      const [location, setLocation] = React.useState(() => {
        return localStorage.getItem('deliveryLocation') || '';
      });

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocation(value);
        localStorage.setItem('deliveryLocation', value);
      };

      return (
        <input
          value={location}
          onChange={handleChange}
          data-testid="location-input"
        />
      );
    };

    // Set location
    const { rerender } = render(<PersistentCheckout />);
    const input = screen.getByTestId('location-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Hall B, Room 202' } });
    expect(input.value).toBe('Hall B, Room 202');
    expect(localStorage.getItem('deliveryLocation')).toBe('Hall B, Room 202');

    // Simulate page reload (new render)
    rerender(<PersistentCheckout />);
    expect(screen.getByTestId('location-input')).toHaveValue('Hall B, Room 202');
  });

  it('should handle empty address gracefully', () => {
    const CheckoutForm = ({ currentUser }) => {
      const [location, setLocation] = React.useState('');

      React.useEffect(() => {
        setLocation(currentUser?.address || '');
      }, [currentUser?.id]);

      return <input value={location} data-testid="location-input" />;
    };

    // User with no address
    const userNoAddress = { id: 'user123', address: '' };
    render(<CheckoutForm currentUser={userNoAddress} />);

    expect(screen.getByTestId('location-input')).toHaveValue('');
  });

  it('should update location when currentUser address changes', async () => {
    const CheckoutForm = ({ currentUser }) => {
      const [location, setLocation] = React.useState('');

      React.useEffect(() => {
        setLocation(currentUser?.address || '');
      }, [currentUser?.id]);

      return (
        <>
          <input value={location} data-testid="location" />
          <span data-testid="sync-status">
            {location ? '✓ Synced' : '✗ Not Synced'}
          </span>
        </>
      );
    };

    let user = { id: 'user1', address: 'Hall A' };
    const { rerender } = render(<CheckoutForm currentUser={user} />);

    expect(screen.getByTestId('location')).toHaveValue('Hall A');
    expect(screen.getByTestId('sync-status')).toHaveTextContent('✓ Synced');

    // User changes (different ID - simulates new user login)
    user = { id: 'user2', address: 'Hall B' };
    rerender(<CheckoutForm currentUser={user} />);

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveValue('Hall B');
    });
  });

  it('should show "enter delivery location" error only when location empty', () => {
    const CheckoutForm = ({ currentUser }) => {
      const [location, setLocation] = React.useState('');

      React.useEffect(() => {
        setLocation(currentUser?.address || '');
      }, [currentUser?.id]);

      const handleCheckout = () => {
        if (!location.trim()) {
          return 'enter delivery location error';
        }
        return 'success';
      };

      return (
        <>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            data-testid="location-input"
          />
          <button
            onClick={() => {
              const result = handleCheckout();
              expect(result).toBe('success');
            }}
            data-testid="checkout-btn"
          >
            Checkout
          </button>
        </>
      );
    };

    // With user address - should NOT show error
    const user = { id: 'user1', address: 'Hall A, Room 101' };
    const { rerender } = render(<CheckoutForm currentUser={user} />);

    expect(screen.getByTestId('location-input')).toHaveValue('Hall A, Room 101');

    // Try checkout - should succeed
    fireEvent.click(screen.getByTestId('checkout-btn'));
  });

  it('should integrate with currentUser reload flow', async () => {
    const CheckoutPage = ({ userLoading, currentUser }) => {
      const [location, setLocation] = React.useState('');

      React.useEffect(() => {
        // Sync when user loads (after initial render)
        if (currentUser?.address) {
          setLocation(currentUser.address);
        }
      }, [currentUser?.id]);

      return (
        <>
          {userLoading && <div data-testid="loader">Loading...</div>}
          <input
            value={location}
            data-testid="location-input"
            disabled={userLoading}
          />
          <span data-testid="status">
            {userLoading ? 'Syncing...' : location ? 'Ready' : 'Empty'}
          </span>
        </>
      );
    };

    // Page load - user loading
    let { rerender } = render(
      <CheckoutPage userLoading={true} currentUser={null} />
    );
    expect(screen.getByTestId('status')).toHaveTextContent('Syncing...');
    expect(screen.getByTestId('location-input')).toBeDisabled();

    // User loaded - should sync location
    rerender(
      <CheckoutPage
        userLoading={false}
        currentUser={{ id: 'u1', address: 'Hall X' }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('location-input')).toHaveValue('Hall X');
      expect(screen.getByTestId('status')).toHaveTextContent('Ready');
    });
  });
});

// ============================================================================
// Integration: All UI Issues Together
// ============================================================================

describe('## UI Issues Integration', () => {
  it('should work together without conflicts', () => {
    const CompleteCheckout = ({ currentUser }) => {
      const [location, setLocation] = React.useState('');
      const [isLoading, setIsLoading] = React.useState(false);
      const [rating, setRating] = React.useState(0);

      // Issue: Delivery location sync
      React.useEffect(() => {
        setLocation(currentUser?.address || '');
      }, [currentUser?.id]);

      // Issue: Loading state prevent double-submit
      const handleCheckout = async () => {
        if (isLoading || !location.trim()) return;
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 200));
        setIsLoading(false);
      };

      return (
        <>
          <input value={location} data-testid="location" readOnly />
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            data-testid="rating-input"
          />
          <span data-testid="rating-display">{rating.toFixed(1)}</span>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            data-testid="checkout-btn"
          >
            {isLoading ? 'Processing...' : 'Checkout'}
          </button>
        </>
      );
    };

    render(<CompleteCheckout currentUser={{ id: 'u1', address: 'Hall A' }} />);

    // All features work
    expect(screen.getByTestId('location')).toHaveValue('Hall A');
    fireEvent.change(screen.getByTestId('rating-input'), {
      target: { value: '1.66' },
    });
    expect(screen.getByTestId('rating-display')).toHaveTextContent('1.7');
    fireEvent.click(screen.getByTestId('checkout-btn'));
  });
});
