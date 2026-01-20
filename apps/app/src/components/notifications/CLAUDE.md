# Notification Components

Client-side React components for TurboKit's Convex-native notification system.

## Components

### NotificationBell

A notification bell icon with unread badge that opens a popover feed.

**Usage:**
```tsx
import { NotificationBell } from "@/components/notifications";

export function Header() {
  return (
    <header>
      <NotificationBell />
    </header>
  );
}
```

**Features:**
- Real-time unread count via Convex subscription
- Shows badge when unread notifications exist
- Badge displays "99+" for counts over 99
- Opens popover with notification feed on click
- Uses design system components (Button, Badge, Popover)

**Props:**
None - fully self-contained component

---

### NotificationsFeed

Displays a list of notifications with read/unread states and actions.

**Usage:**
```tsx
import { NotificationsFeed } from "@/components/notifications";

// Standalone usage
<NotificationsFeed onClose={() => console.log("closed")} />

// Used automatically by NotificationBell in its popover
```

**Features:**
- Real-time notification list (limit: 20)
- Visual distinction for unread notifications
- Click notification to mark as read and navigate to link
- "Mark all as read" button when unread exist
- Relative timestamps (e.g., "2 minutes ago")
- Loading skeleton states
- Empty state when no notifications
- Scrollable area for long lists (max height: 400px)

**Props:**
- `onClose?: () => void` - Callback when popover should close (e.g., after navigation)

**Behavior:**
- Unread notifications have a blue dot indicator
- Clicking a notification marks it as read (if unread)
- If notification has a `link`, navigates to that URL
- Uses `window.location.href` for navigation (forces page reload)

**Styling:**
- Width: 96 (384px)
- Unread: Blue dot + semi-bold title + accent background
- Read: Normal font weight + no background highlight
- Hover: Accent background on all items

---

### NotificationPreferences

Settings panel for managing notification preferences across channels.

**Usage:**
```tsx
import { NotificationPreferences } from "@/components/notifications";

// In a settings page
export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <NotificationPreferences />
    </div>
  );
}
```

**Features:**
- Toggle in-app notifications (notification bell)
- Toggle push notifications (FCM/APNs/Web Push)
- Toggle email notifications
- Per-type notification preferences (if configured)
- Toast feedback on preference changes
- Loading skeleton states
- Real-time preference updates

**Props:**
None - fully self-contained component

**Preference Types:**
1. **In-App** - Controls notification bell feed
2. **Push** - Controls push notifications to devices
3. **Email** - Controls email notifications
4. **Types** (optional) - Per-notification-type toggles (e.g., "user.welcome", "billing.renewal")

**Type-Specific Preferences:**
When the backend creates notifications with specific types, users can control them individually:
```typescript
// Backend creates notification with type
await ctx.runMutation(api.app.notifications.mutations.create, {
  userId: user._id,
  type: "billing.renewal",
  title: "Subscription Renewal",
  body: "Your subscription will renew tomorrow.",
});

// User can disable this specific type in preferences
// NotificationPreferences component shows toggle for "billing › renewal"
```

---

## Integration Examples

### Add to App Layout (Recommended)

```tsx
// apps/app/src/app/layout.tsx or components/header.tsx
import { NotificationBell } from "@/components/notifications";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between p-4">
      <div>Logo</div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
```

### Add to Settings Page

```tsx
// apps/app/src/app/settings/page.tsx
import { NotificationPreferences } from "@/components/notifications";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <NotificationPreferences />
    </div>
  );
}
```

### Custom Notification Display

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/api";

export function CustomNotificationList() {
  const notifications = useQuery(api.app.notifications.queries.listUnread);
  const markRead = useMutation(api.app.notifications.mutations.markRead);

  return (
    <div>
      {notifications?.map((n) => (
        <div key={n._id} onClick={() => markRead({ notificationId: n._id })}>
          <h4>{n.title}</h4>
          <p>{n.body}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Backend Integration

These components work with the Convex notification backend:

**Queries used:**
- `api.app.notifications.queries.countUnread` - Real-time unread count
- `api.app.notifications.queries.list` - Notification feed (paginated)
- `api.app.notifications.queries.getPreferences` - User preferences

**Mutations used:**
- `api.app.notifications.mutations.markRead` - Mark single notification as read
- `api.app.notifications.mutations.markAllRead` - Mark all as read
- `api.app.notifications.mutations.updatePreferences` - Update user preferences

**Creating notifications from backend:**
```typescript
// From any mutation or internal action
await ctx.runMutation(api.app.notifications.mutations.create, {
  userId: user._id,
  type: "user.welcome",
  title: "Welcome to TurboKit!",
  body: "Let's get you started.",
  link: "/getting-started",
  icon: "welcome",
});
```

See `packages/backend/convex/app/notifications/CLAUDE.md` for full backend documentation.

---

## Styling & Customization

All components use TurboKit design tokens and can be customized via CSS variables:

**Primary colors:**
- `--primary` - Badge color, unread dot
- `--accent` - Hover background, unread notification background
- `--muted-foreground` - Timestamps, descriptions

**Spacing:**
- Notification feed width: `w-96` (384px)
- Feed height: `h-[400px]`
- Item padding: `p-4`

**To customize:**
```css
/* In your globals.css or component CSS */
.notification-bell-badge {
  --primary: oklch(0.7 0.25 270); /* Purple instead of default */
}
```

---

## Dependencies

**Convex:**
- `convex/react` - `useQuery`, `useMutation`
- `@repo/backend/api` - Generated API

**Design System:**
- `@repo/design/components/ui/button`
- `@repo/design/components/ui/badge`
- `@repo/design/components/ui/popover`
- `@repo/design/components/ui/scroll-area`
- `@repo/design/components/ui/separator`
- `@repo/design/components/ui/card`
- `@repo/design/components/ui/switch`
- `@repo/design/components/ui/label`
- `@repo/design/hooks/use-toast`
- `@repo/design/lib/utils` - `cn()`

**Other:**
- `lucide-react` - Icons (Bell, CheckCheck)
- `date-fns` - Time formatting

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper labels and descriptions
- **Focus Management**: Logical focus order
- **Screen Readers**: Semantic HTML and ARIA attributes
- **Contrast**: All text meets minimum contrast ratios

**Keyboard shortcuts:**
- NotificationBell: `Space`/`Enter` to open
- NotificationsFeed: `Tab` to navigate items, `Enter` to select
- NotificationPreferences: `Space` to toggle switches

---

## Performance

**Real-time updates:**
- Components use Convex subscriptions for live updates
- No polling or manual refresh needed
- Updates propagate instantly when backend creates notifications

**Optimization:**
- NotificationsFeed limits to 20 notifications
- Scroll area prevents layout shift
- Skeleton states prevent content flash
- Toast notifications are debounced

---

## TypeScript Support

All components are fully typed with TypeScript:

```typescript
// Notification type (from Convex schema)
type Notification = {
  _id: Id<"notifications">;
  userId: Id<"users">;
  type: string;
  title: string;
  body: string;
  read: boolean;
  archived: boolean;
  link?: string;
  icon?: string;
  data?: any;
  createdAt: number;
  readAt?: number;
  archivedAt?: number;
};

// Preferences type
type NotificationPreferences = {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types?: Record<string, boolean>;
};
```

---

## Testing

### Component Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationBell } from "@/components/notifications";

// Mock Convex hooks
jest.mock("convex/react", () => ({
  useQuery: jest.fn(() => 5), // Mock unread count
  useMutation: jest.fn(() => jest.fn()),
}));

test("displays unread count", () => {
  render(<NotificationBell />);
  expect(screen.getByText("5")).toBeInTheDocument();
});
```

### Integration Testing

Test with actual Convex backend in development mode:
```typescript
// Create test notification
await ctx.runMutation(api.app.notifications.mutations.create, {
  userId: testUserId,
  type: "test",
  title: "Test Notification",
  body: "This is a test",
});

// Verify it appears in NotificationBell
// Check unread count increments
// Test mark as read functionality
```

---

## Common Issues

**Issue: Notifications not appearing**
- Check user is authenticated (`requireAuth` in backend)
- Verify notification preferences allow in-app notifications
- Check browser console for Convex connection errors

**Issue: Unread count not updating**
- Ensure `useQuery` is not disabled
- Check Convex subscription is active
- Verify backend mutation is actually creating notification

**Issue: Navigation not working**
- Ensure `link` property is set when creating notification
- Check `window.location.href` is appropriate for your routing
- Consider using Next.js router for client-side navigation

**Fix for Next.js routing:**
```typescript
// In NotificationsFeed.tsx
import { useRouter } from "next/navigation";

const router = useRouter();

// Replace window.location.href
if (notification.link) {
  router.push(notification.link);
  onClose?.();
}
```

---

## Roadmap

Potential enhancements:
- [ ] Notification grouping (e.g., "3 new messages")
- [ ] Sound effects for new notifications
- [ ] Desktop notifications (Web Notifications API)
- [ ] Notification actions (e.g., "Accept", "Decline" buttons)
- [ ] Rich media (images, videos in notifications)
- [ ] Notification search/filter
- [ ] Archive functionality in UI
- [ ] Infinite scroll for notification history

---

## Related Documentation

- Backend: `packages/backend/convex/app/notifications/CLAUDE.md`
- Design System: `packages/design/CLAUDE.md`
- Icons: `packages/design/icons/`
