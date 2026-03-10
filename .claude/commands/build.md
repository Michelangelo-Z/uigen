# Build Project

Create a production build and verify TypeScript compilation.

## What it does
- Runs `npm run build`
- Compiles TypeScript to JavaScript
- Performs static analysis
- Optimizes assets for production
- Validates that there are no errors

## Usage
```
/build
```

## Build Steps
1. TypeScript compilation and type checking
2. Next.js bundling and optimization
3. Static page generation
4. Build output summary

## Output
The build process creates:
- `.next/` directory with compiled assets
- Route size analysis
- Build timing information
- First Load JS metrics

## Common Build Issues
- TypeScript errors - Fix type issues before building
- Import errors - Check that all imports are correct
- Missing environment variables - Set in .env.local

## Notes
- A successful build is required before deploying
- The build output shows route sizes and performance metrics
- Build time typically takes 8-15 seconds on modern hardware
