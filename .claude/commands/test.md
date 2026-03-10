# Run Tests

Run the Vitest test suite to verify that all tests pass.

## What it does
- Runs `npm test`
- Executes all test files in the project
- Reports test results and coverage
- Can be run with specific test files

## Usage
```
/test
/test -- MessageList.test.tsx
/test -- --watch
```

## Test Files
- `src/lib/__tests__/` - Library tests (file-system, jsx-transformer, etc.)
- `src/components/**/__tests__/` - Component tests
- `src/lib/contexts/__tests__/` - Context tests

## Coverage
The test suite covers:
- Happy paths and normal usage
- Edge cases and error conditions
- TypeScript type safety

## Notes
- Tests run in isolation with cleanup between tests
- Use `--watch` flag for continuous testing during development
- All tests must pass before committing code
