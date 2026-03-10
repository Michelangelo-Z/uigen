# Format and Lint Code

Run Ruff to format and lint the codebase.

## What it does
- Runs `npm run ruff format .` to format code
- Runs `npm run ruff check .` to check for issues
- Fixes common issues with `npm run ruff check . --fix`

## Usage
```
/lint
```

## Code Style Requirements
- Maximum line length: 88 characters
- PEP 8 naming conventions
- Import sorting (I001)
- No unused imports
- String formatting with parentheses for long lines
- Multi-line function calls with proper indentation

## Common Issues Fixed Automatically
- Line length violations
- Unsorted imports
- Unused variables and imports
- Inconsistent spacing

## Notes
- Ruff formatting is much faster than other formatters
- Always run lint before committing
- Some issues may require manual fixes
