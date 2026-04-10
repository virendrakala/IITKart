# Test Suite Documentation

## Overview

This comprehensive test suite verifies all 21 issues (#78-#98) from the payment branch PR. Tests cover backend reliability, database performance, frontend UI/UX, and integration scenarios.

## Test Files

### Backend Tests

#### 1. **integration-all-issues.test.ts**
Comprehensive integration tests covering all 21 issues:

- **#98**: Checkout Queue System (100% success vs 4-6%)
- **#93**: Atomic order status updates
- **#92**: Real-time stock validation
- **#91**: Async webhook notifications
- **#90**: Payment reconciliation matching
- **#89**: Delivery assignment uniqueness
- **#88**: Order history query optimization (10x faster)
- **#87**: Concurrent order safeguards
- **#86**: Stock deduction atomicity
- **#85**: Inventory tracking consistency
- **#84**: Order auto-timeout handling (15 min)
- **#83**: Automated refund workflow
- **#82**: Order cancellation with stock restoration
- **#81**: FIFO stock allocation fairness
- **#80**: Order status history persistence
- **#79**: Transaction optimization (30% faster)
- **#78**: Order processing reliability (99.9%)
- **#97**: 3-step delivery workflow
- **#96**: Payment modal Z-index (frontend)
- **#95**: Rating display precision (frontend)
- **#94**: Loading states (frontend)

**Run:**
```bash
npm run test:integration
```

**Key Tests:**
```typescript
// 100 concurrent checkouts
await testCheckoutQueue(); // Expected: 100% success

// 1000 orders in order history
await testOrderHistory(); // Expected: <200ms query time

// Payment mismatch detection
await testPaymentReconciliation(); // Expected: 95% success rate
```

#### 2. **stress-test.ts**
Performance and stress testing under load:

```bash
# Basic run (100 users, 60s duration)
npm run test:stress

# Custom parameters
API_URL=http://localhost:3000/api \
CONCURRENT_USERS=500 \
TEST_DURATION=120 \
npm run test:stress
```

**Stress Test Scenarios:**

| Test | Input | Expected | Target |
|------|-------|----------|--------|
| Queue (100 concurrent) | 100 checkouts | ≥99% success | 100% |
| Reliability (100 orders) | Create orders | 99.9% completion | 99.9% |
| Transaction Performance | 30 transactions | <70ms avg | 30% faster |
| Stock Fairness | 50 requests / 10 stock | ≤10 success | Fair FIFO |
| Payment Reconciliation | 20 orders | ≥95% matched | Accurate |
| Delivery Workflow | 5 workflows | 3/5 complete | 3-step |
| Timeout Processing | Simulated | Auto-cancel | 15 min |

#### 3. **queue-persistence.test.ts** ✨ NEW
Queue resilience and persistence testing:

**Coverage:**
- Queue state recovery after server restart
- Queue capacity handling (250+ concurrent)
- FIFO order maintenance
- Exponential backoff on overflow
- Corrupted entry handling
- Automatic retry mechanisms
- Failed order marking

**Run:**
```bash
npm run test:queue
npm run test:with-dev  # Starts dev server automatically
```

#### 4. **payment-edge-cases.test.ts** ✨ NEW
Payment and refund edge case scenarios:

**Coverage:**
- Multiple payment source reconciliation (webhook, API, DB)
- Partial payment handling
- Refund amount validation
- Over-refund prevention
- Duplicate payment detection
- Payment timeout and expiration
- Refund retry mechanism

**Run:**
```bash
npm run test:payment
```

#### 5. **concurrent-resilience.test.ts** ✨ NEW
Concurrent processing and database resilience:

**Coverage:**
- Transaction atomicity (50 concurrent updates)
- Write conflict handling
- Database connection recovery
- Connection pool exhaustion handling
- Dirty read prevention
- Phantom read prevention
- Deadlock detection and prevention
- Write amplification optimization
- Query result caching

**Run:**
```bash
npm run test:concurrent
```

#### 6. **delivery-rider.test.ts** ✨ NEW
Delivery workflow and rider management:

**Coverage:**
- 3-step workflow enforcement (assigned → picked → delivered)
- Prevent delivery without pickup
- Prevent pickup without assignment
- Rider assignment uniqueness
- Prevent reassignment after pickup
- Location tracking and history
- ETA calculation
- Delivery address persistence
- Rider availability tracking
- Rider performance metrics

**Run:**
```bash
npm run test:delivery
```

### Frontend Tests

#### 7. **ui-issues.test.ts**
UI/UX component tests:

```bash
npm run test:frontend
```

**Tests:**

1. **Issue #96 - Razorpay Z-Index Fixes**
   ```typescript
   // Dialog: z-40, Razorpay: z-9999
   // First-click responsiveness: <100ms
   // Pointer-events: none on overlay during payment
   ```

2. **Issue #95 - Rating Display Precision**
   ```typescript
   // 1.66666 → "1.7" (exactly 1 decimal)
   // Backend storage: full precision
   // UI display: rounded for readability
   ```

3. **Issue #94 - Loading States**
   ```typescript
   // Button disable during async operation
   // Loading spinner visible
   // Prevent double-submission
   // Auto-timeout after 30s
   // Error/success toast feedback
   ```

## Running Tests

### Quick Start (With Auto-Start Dev Server)
```bash
# Run all tests with dev server automatically started
npm run test:with-dev

# Run specific suite with dev server
npm run test:integration:with-dev
npm run test:stress:with-dev
npm run test:all-with-dev
```

### All Tests
```bash
npm run test
```

### Specific Test Suite
```bash
# 21 issues integration tests
npm run test:integration

# Queue persistence & resilience
npm run test:queue

# Payment edge cases & refunds
npm run test:payment

# Concurrent processing & database resilience
npm run test:concurrent

# Delivery workflow & rider management
npm run test:delivery

# Stress/performance
npm run test:stress

# Frontend UI
npm run test:frontend

# Single issue (example)
npm run test -- --testNamePattern="Checkout Queue"
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

### Test Script Usage
```bash
# Make script executable
chmod +x scripts/test-with-dev.sh

# Run with different test types
./scripts/test-with-dev.sh                    # All tests
./scripts/test-with-dev.sh integration        # Integration tests only
./scripts/test-with-dev.sh stress             # Stress tests only
./scripts/test-with-dev.sh coverage           # Coverage report
./scripts/test-with-dev.sh watch              # Watch mode
```

**The test-with-dev script automatically:**
- Kills any process on port 3000
- Starts the dev server
- Waits for API to be ready (up to 30s)
- Runs the test suite
- Gracefully shuts down the server
- Returns appropriate exit code

## Test Configuration

### Jest Config (Backend)
```json
{
  "testEnvironment": "node",
  "collectCoverageFrom": ["src/**/*.ts"],
  "coverageThreshold": {
    "lines": 80,
    "functions": 80
  },
  "testTimeout": 30000
}
```

### Performance Baselines

| Metric | Baseline | Target | Improvement |
|--------|----------|--------|-------------|
| Checkout success | 4-6% | 100% | 20x |
| Query time (1000 records) | 2-3s | <200ms | 10-15x |
| Transaction time | 70-80ms | <70ms | 30% |
| Payment reconciliation | N/A | ≥95% | New |
| Delivery workflow | N/A | 3-step | New |

## Expected Results

### Before Fix
```
Checkout Success: 4-6% ❌ (94-96% failures)
Order Processing: 95% (5% silent failures)
Query Time: 2-3s (slow)
Stock Conflicts: Common
Payment Mismatches: Occasional
```

### After Fix
```
Checkout Success: 100% ✅
Order Processing: 99.9% (automatic retries)
Query Time: 100-200ms (10x faster)
Stock Conflicts: None (atomic)
Payment Mismatches: Auto-detected & resolved
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/tests.yml
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:integration
      - run: npm run test:stress
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2
```

## Troubleshooting

### Tests Failing

1. **Database Connection**
   ```bash
   # Ensure database is running
   docker-compose up -d db
   npm run db:migrate
   ```

2. **API Not Starting**
   ```bash
   # Check API server
   npm run dev
   ```

3. **Timeout Issues**
   ```bash
   # Increase timeout for slow environments
   npm run test -- --testTimeout=60000
   ```

### Performance Issues

1. **Slow Tests**
   ```bash
   # Run only failed tests
   npm run test -- --lastCommit
   ```

2. **Memory Limits**
   ```bash
   # Increase Node memory
   NODE_OPTIONS=--max-old-space-size=4096 npm run test
   ```

## Performance Profiling

### Run Profiler
```bash
node --prof Backend1/tests/stress-test.ts
node --prof-process isolate-*.log > profile.txt
```

### Memory Snapshot
```bash
node --inspect Backend1/tests/integration-all-issues.test.ts
# Open `chrome://inspect` in Chrome, take heap snapshot
```

## Coverage Goals

```
Backend: 80%+
- Services: 90%
- Controllers: 85%
- Utils: 80%
- Middlewares: 75%

Frontend: 75%+
- Components: 85%
- Hooks: 80%
- Utils: 70%
```

## Adding New Tests

### Template: Backend Test

```typescript
describe('## ISSUE #XYZ - Feature Name', () => {
  let setupData: any;

  beforeAll(async () => {
    // Setup
  });

  it('should verify fix', async () => {
    const result = await testFunction();
    expect(result).toBe(expectedValue);
    
    console.log(`\n✅ Issue #XYZ Results:`);
    console.log(`   Test result: ${result}`);
  });
});
```

### Template: Frontend Test

```typescript
describe('## ISSUE #XYZ - UI Component', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(<Component />);
    const element = getByTestId('element-id');
    
    expect(element).toBeTruthy();
  });
});
```

## Continuous Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3000/api/health/tests

# Response:
{
  "status": "healthy",
  "lastRun": "2026-04-10T14:30:00Z",
  "passRate": 100,
  "duration": 45000
}
```

### Dashboard
Open: http://localhost:3000/test-dashboard

Shows:
- Real-time test status
- Performance metrics
- Issue tracking
- Historical trends

## Related Documentation

- [PULL_REQUEST.md](../PULL_REQUEST.md) - Detailed issue descriptions
- [README.md](../README.md) - Project overview
- [SETUP_GUIDE.md](../frontend/SETUP_GUIDE.md) - Environment setup

## Support

For test failures or questions:
1. Check logs: `tail -f logs/test.log`
2. Review GitHub issues: https://github.com/palakbandhu/IITKart
3. Run with verbose output: `npm run test -- --verbose`
