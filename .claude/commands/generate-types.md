# Generate TypeScript Types

Generate TypeScript type definitions from the Prisma schema.

## What it does
- Runs `npm run generate-types`
- Generates TypeScript interfaces from Prisma models
- Updates type definitions to match the database schema
- Provides full IDE autocomplete support

## Usage
```
/generate-types
```

## When to Run
- After modifying `prisma/schema.prisma`
- When adding new database models
- When changing field types or relationships
- To keep TypeScript types in sync with the database

## Generated Types
The command generates:
- Model interfaces for each Prisma model
- Field types matching the schema
- Relationship types
- Input/output types for queries

## Benefits
- Type-safe database queries
- IDE autocomplete for model fields
- Compile-time error catching
- Better developer experience

## Related Commands
- `/db-reset` - Reset database when schema changes are made
- `/test` - Run tests to verify types work correctly
- `/build` - Build checks that types are correct

## Notes
- Generated types are automatically used throughout the app
- Never manually edit generated type files
- Always run this after schema changes
