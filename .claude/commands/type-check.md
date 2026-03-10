# Type Check Code

Run TypeScript type checking with Pyrefly for comprehensive type validation.

## What it does
- Initializes type checking if needed: `pyrefly init`
- Checks for TypeScript type errors: `pyrefly check`
- Fixes type issues and provides detailed error messages

## Usage
```
/type-check
```

## Type Checking Requirements
- All function parameters must have explicit types
- Return types should be specified
- Optional types must include explicit None checks
- String types should be narrowed when needed
- No implicit `any` types

## Common Issues
- Missing type annotations on function parameters
- Unchecked Optional[T] types without None validation
- Type mismatches in function calls
- Missing imports for type definitions

## Notes
- Type checking runs automatically as part of CI/CD
- All type errors must be fixed before code can be merged
- Warnings about versions can be ignored if all checks pass
- Type checking is much faster than running tests
