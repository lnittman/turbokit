# Database Migrations

This directory contains database migration scripts using `@convex-dev/migrations`.

## What are migrations?

Migrations are scripts that modify your Convex database schema or data. Use them when you need to:
- Backfill existing data with new fields
- Transform data structures
- Create default records for all users
- Clean up orphaned data

## Creating a migration

1. Create a new file: `migrations/NNN_description.ts` (e.g., `001_add_notification_preferences.ts`)
2. Import and use `makeMigration`:

```typescript
import { makeMigration } from "@convex-dev/migrations";

export default makeMigration({
  async up(ctx) {
    // Forward migration
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.insert("notificationPreferences", {
        userId: user._id,
        email: true,
        push: true,
        inApp: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
  // Optional: rollback migration
  // async down(ctx) {
  //   const prefs = await ctx.db.query("notificationPreferences").collect();
  //   for (const pref of prefs) {
  //     await ctx.db.delete(pref._id);
  //   }
  // },
});
```

3. Run the migration:

```bash
npx convex run migrations:NNN_description
```

## Running migrations

### Development
```bash
# Run a specific migration
npx convex run migrations:001_add_notification_preferences

# Check migration status
npx convex run migrations:status
```

### Production
Migrations should be run as part of your deployment process. Add to your CI/CD pipeline:

```bash
npx convex deploy
npx convex run --prod migrations:001_add_notification_preferences
```

## Best practices

1. **Test migrations locally first** - Always test on dev before prod
2. **Make migrations idempotent** - Check if data already exists before inserting
3. **Batch large operations** - Use `ctx.db.query().paginate()` for large tables
4. **Log progress** - Use `console.log()` to track migration progress
5. **Keep migrations small** - One logical change per migration
6. **Never delete migrations** - Once run in production, keep the file

## Example: Idempotent migration

```typescript
export default makeMigration({
  async up(ctx) {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      // Check if preferences already exist
      const existing = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();

      if (!existing) {
        await ctx.db.insert("notificationPreferences", {
          userId: user._id,
          email: true,
          push: true,
          inApp: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
  },
});
```

## Troubleshooting

**Migration fails mid-way**
- Make migration idempotent (check for existing data)
- Run again (idempotent migrations can be safely re-run)

**Large table migration takes too long**
- Use pagination: `await ctx.db.query("table").paginate({ numItems: 100 })`
- Process in batches

**Need to rollback**
- Implement `down()` migration
- Run rollback: `npx convex run migrations:rollback:NNN_description`

## Related

- Convex migrations docs: https://docs.convex.dev/database/migrations
- `@convex-dev/migrations`: https://www.convex.dev/components/migrations
