# Notifications System - AI Agent Instructions

**100% Convex-Native • Zero Firebase Platform • Mobile Push Ready**

Real-time, type-safe notification system built entirely on Convex. No external services required for in-app notifications; optional mobile push for native iOS/Android apps.

---

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [API Reference](#api-reference)
5. [Per-Project Setup](#per-project-setup)
6. [Mobile Push Setup](#mobile-push-setup)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What You Get Out of the Box

✅ **In-app notifications** - Real-time Convex subscriptions
✅ **Mobile push notifications** - FCM (Android), APNs (iOS)
✅ **User preferences** - Email, push, in-app, per-type
✅ **Device token management** - Multi-device support
✅ **Read/unread/archive tracking** - Full notification lifecycle
✅ **Activity logging** - Audit trail for all notifications
✅ **Type-safe workflows** - Integration with Convex workflows

### Architecture Philosophy

- **Token-based**: All devices register tokens with Convex
- **Platform detection**: Backend automatically sends to APNs/FCM/Web
- **No Firebase Platform**: Use FCM HTTP API without Firebase SDK/console
- **Native iOS focus**: Swift/SwiftUI implementation (no React Native)
- **Zero cost**: APNs and FCM are free (except $99/yr Apple Developer)

### Files

```
packages/backend/convex/
├── app/notifications/
│   ├── queries.ts          # Real-time feeds, counts, preferences
│   ├── mutations.ts        # CRUD, mark read, device tokens
│   ├── internal.ts         # Push delivery (FCM/APNs)
│   └── AGENTS.md           # This file (symlinked as CLAUDE.md)
│
├── lib/
│   └── push.ts             # FCM/APNs implementation (no Firebase SDK)
│
└── schema.ts               # Tables: notifications, deviceTokens, notificationPreferences

apps/app/src/components/notifications/
├── notification-bell.tsx   # Unread badge component
├── notification-list.tsx   # Real-time notification feed
└── preferences.tsx         # User notification settings
```

---

## Quick Start

### 1. In-App Notifications (Works Immediately)

**Frontend Component:**
```tsx
// apps/app/src/components/notifications/notification-bell.tsx
"use client";
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/api';

export function NotificationBell() {
  const unreadCount = useQuery(api.app.notifications.queries.countUnread);
  const notifications = useQuery(api.app.notifications.queries.list, { limit: 5 });
  const markRead = useMutation(api.app.notifications.mutations.markRead);

  return (
    <button>
      <BellIcon />
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      <Dropdown>
        {notifications?.map(n => (
          <div key={n._id} onClick={() => markRead({ notificationId: n._id })}>
            <h4>{n.title}</h4>
            <p>{n.body}</p>
          </div>
        ))}
      </Dropdown>
    </button>
  );
}
```

**Backend - Send Notification:**
```typescript
// From workflow, cron, or webhook
import { api } from '@repo/backend/api';

await ctx.runMutation(api.app.notifications.mutations.create, {
  userId: user._id,
  type: 'user.welcome',
  title: 'Welcome to TurboKit!',
  body: 'Let's get you started.',
  link: '/getting-started',
  icon: 'welcome',
});
```

### 2. Mobile Push (Optional - Requires Setup)

**Backend - Send Push Notification:**
```typescript
import { internal } from '@repo/backend/api';

await ctx.runAction(internal.app.notifications.internal.sendPush, {
  userId: user._id,
  title: 'New Message',
  body: 'You have a new message',
  data: { messageId: 'msg_123' },
  badge: 1, // iOS - app icon badge
  imageUrl: 'https://example.com/image.png', // Android - rich notification
});
```

**Setup Required:** See [Mobile Push Setup](#mobile-push-setup) section below.

---

## Architecture

### Database Tables

**1. `notifications`** - In-app notifications
```typescript
{
  userId: Id<"users">,
  type: string,              // e.g., "user.welcome", "billing.renewal"
  title: string,
  body: string,
  data: any,                 // Custom JSON data
  link: string,              // Deep link/URL
  icon: string,              // Icon name/URL
  read: boolean,
  archived: boolean,
  createdAt: number,
  updatedAt: number,
}
```

**2. `deviceTokens`** - Push notification device tokens
```typescript
{
  userId: Id<"users">,
  token: string,             // APNs/FCM device token
  platform: "apns" | "fcm" | "web",
  deviceInfo: {
    model: string,
    os: string,
    osVersion: string,
  },
  lastUsed: number,
  createdAt: number,
}
```

**3. `notificationPreferences`** - User preferences
```typescript
{
  userId: Id<"users">,
  email: boolean,            // Email notifications enabled
  push: boolean,             // Push notifications enabled
  inApp: boolean,            // In-app notifications enabled
  types: {                   // Per-type overrides
    "billing.renewal": boolean,
    "user.welcome": boolean,
  },
  createdAt: number,
  updatedAt: number,
}
```

### No Firebase Platform Required

**What We Use:**
- ✅ In-app: **Convex subscriptions** (real-time, built-in)
- ✅ Android: **FCM HTTP v1 API** (via Google Cloud service account)
- ✅ iOS: **APNs HTTP/2 API** (via Apple auth key)

**What We DON'T Use:**
- ❌ Firebase Console
- ❌ Firebase SDK
- ❌ Firebase Analytics/Firestore/Auth

**Why This Works:**
- FCM is Google's push service (separate from Firebase platform)
- You can call FCM HTTP API without Firebase SDK
- iOS doesn't use Firebase at all - native APNs only

---

## API Reference

### Queries

#### `api.app.notifications.queries.list`
Get user's notifications (real-time subscription).

```typescript
const notifications = useQuery(api.app.notifications.queries.list, {
  limit: 20,              // Optional, default 50
  offset: 0,              // Optional, for pagination
  filter: "unread",       // Optional: "all" | "unread" | "read"
});
```

#### `api.app.notifications.queries.countUnread`
Get unread notification count.

```typescript
const unreadCount = useQuery(api.app.notifications.queries.countUnread);
// Returns: number
```

#### `api.app.notifications.queries.getPreferences`
Get user's notification preferences.

```typescript
const prefs = useQuery(api.app.notifications.queries.getPreferences);
// Returns: { email: boolean, push: boolean, inApp: boolean, types: {...} }
```

### Mutations

#### `api.app.notifications.mutations.create`
Create a new notification (checks user preferences automatically).

```typescript
await ctx.runMutation(api.app.notifications.mutations.create, {
  userId: user._id,
  type: "user.welcome",
  title: "Welcome!",
  body: "Let's get started.",
  link: "/dashboard",       // Optional
  icon: "bell",             // Optional
  data: { foo: "bar" },     // Optional
});
```

#### `api.app.notifications.mutations.markRead`
Mark notification as read.

```typescript
const markRead = useMutation(api.app.notifications.mutations.markRead);
await markRead({ notificationId: notification._id });
```

#### `api.app.notifications.mutations.markAllRead`
Mark all user notifications as read.

```typescript
const markAllRead = useMutation(api.app.notifications.mutations.markAllRead);
await markAllRead();
```

#### `api.app.notifications.mutations.archive`
Archive a notification.

```typescript
const archive = useMutation(api.app.notifications.mutations.archive);
await archive({ notificationId: notification._id });
```

#### `api.app.notifications.mutations.updatePreferences`
Update user notification preferences.

```typescript
await ctx.runMutation(api.app.notifications.mutations.updatePreferences, {
  push: false,              // Disable all push notifications
  types: {
    "billing.renewal": false, // Disable specific type
    "user.welcome": true,     // Enable specific type
  },
});
```

#### `api.app.notifications.mutations.registerDeviceToken`
Register device token for push notifications (called from native app).

```typescript
await ctx.runMutation(api.app.notifications.mutations.registerDeviceToken, {
  token: "apns_device_token_hex_string",
  platform: "apns", // or "fcm" or "web"
  deviceInfo: {
    model: "iPhone 15 Pro",
    os: "iOS",
    osVersion: "17.4",
  },
});
```

### Internal Actions

#### `internal.app.notifications.internal.sendPush`
Send push notification to user's devices (iOS/Android).

```typescript
await ctx.runAction(internal.app.notifications.internal.sendPush, {
  userId: user._id,
  title: "New Message",
  body: "You have a new message from Alice",
  data: { messageId: "msg_123" },  // Optional - custom data
  link: "/messages/msg_123",       // Optional - deep link
  badge: 5,                        // Optional - iOS badge count
  imageUrl: "https://...",         // Optional - Android image
});

// Returns: { sent: 2, failed: 0, total: 2 }
```

#### `internal.app.notifications.internal.notifyUser`
Create in-app notification + optionally send push.

```typescript
await ctx.runAction(internal.app.notifications.internal.notifyUser, {
  userId: user._id,
  type: "user.welcome",
  title: "Welcome!",
  body: "Let's get started.",
  sendPush: true,           // Optional - also send push notification
  link: "/dashboard",
  icon: "bell",
});
```

### Notification Types

Define your notification types as constants:

```typescript
// lib/notificationTypes.ts
export const NOTIFICATION_TYPES = {
  // User lifecycle
  USER_WELCOME: "user.welcome",
  USER_ONBOARDED: "user.onboarded",

  // Billing
  BILLING_RENEWAL: "billing.renewal",
  BILLING_FAILED: "billing.failed",
  TRIAL_ENDING: "billing.trial_ending",

  // System
  SYSTEM_MAINTENANCE: "system.maintenance",
  FEATURE_ANNOUNCEMENT: "feature.announcement",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
```

### Workflows Integration

```typescript
// workflows/user-onboarding.ts
import { workflow } from "./manager";
import { internal } from "../../_generated/api";

export const userOnboarding = workflow.define({
  args: { userId: v.id("users"), userName: v.string() },
  handler: async (step, { userId, userName }) => {
    // Send welcome notification
    await step.runAction(
      internal.app.notifications.internal.notifyUserWelcome,
      { userId, userName }
    );

    // Send completion notification after workflow steps
    await step.runMutation(api.app.notifications.mutations.create, {
      userId,
      type: "user.onboarded",
      title: "You're all set!",
      body: "Congratulations on completing the setup.",
      icon: "check",
    });
  },
});
```

### Bulk Notifications

```typescript
import { internal } from "@repo/backend/api";

// Notify multiple users at once
await ctx.runMutation(internal.app.notifications.mutations.bulkCreate, {
  notifications: users.map((user) => ({
    userId: user._id,
    type: "feature.announcement",
    title: "New Feature: Dark Mode",
    body: "Check out our new dark mode theme!",
    link: "/settings/appearance",
  })),
});
```

---

## Per-Project Setup

### In-App Notifications (Zero Setup Required)

**Status**: ✅ Works immediately in new projects

**What to do**: Nothing! Just use it:

```typescript
// Backend: Send notification
await ctx.runMutation(api.app.notifications.mutations.create, {
  userId: user._id,
  type: 'user.welcome',
  title: 'Welcome!',
  body: 'Let's get started.',
});

// Frontend: Display notifications (components already built)
import { NotificationBell } from '@/components/notifications/notification-bell';
```

**Files involved**:
- Backend: `packages/backend/convex/app/notifications/{queries,mutations}.ts`
- Frontend: `apps/app/src/components/notifications/*`
- Schema: Already in `packages/backend/convex/schema.ts`

---

### Mobile Push Notifications

Mobile push requires **two separate setups**:

1. **Backend Setup** (once per Convex project) - Add environment variables
2. **App Setup** (once per iOS/Android app) - Add native code to register device tokens

The backend code in TurboKit is already complete - you just need to configure credentials and integrate your mobile apps.

---

## Mobile Push Setup

### Setup Overview

**For each new TurboKit-based Convex backend:**
- iOS: Add 4 environment variables to Convex Dashboard (~10 min)
- Android: Add 2 environment variables to Convex Dashboard (~10 min)

**For each iOS app connecting to your backend:**
- Add AppDelegate code (~5 min)
- Enable Push Notifications capability in Xcode (~1 min)

**For each Android app connecting to your backend:**
- Add FirebaseMessagingService code (~5 min)
- Update AndroidManifest.xml (~2 min)

---

## Backend Setup (Once Per Convex Project)

### iOS Backend Setup

**What**: Add APNs credentials to Convex environment variables
**When**: Once per Convex backend project
**Time**: ~10 minutes

#### Step 1: Generate APNs Auth Key (Apple Developer Console)

```bash
# Go to: https://developer.apple.com/account/resources/authkeys/list
# Click "+" → Select "Apple Push Notifications service (APNs)"
# Download .p8 file (e.g., AuthKey_ABC123XYZ.p8)
# Note the Key ID from filename (e.g., ABC123XYZ)
```

#### Step 2: Get Apple Developer Team ID

```bash
# Go to: https://developer.apple.com/account
# Top right corner: Click "Membership"
# Copy "Team ID" (10 characters, e.g., DEF456UVW)
```

#### Step 3: Convert .p8 File to Base64

```bash
# In terminal:
cd ~/Downloads  # or wherever your .p8 file is
cat AuthKey_ABC123XYZ.p8 | base64 | tr -d '\n'

# Copy the entire base64 output (starts with "LS0tLS1C...")
```

#### Step 4: Add Environment Variables to Convex Dashboard

```bash
# Convex Dashboard → Your Project → Settings → Environment Variables
# Add these 4 variables:

APNS_KEY_ID="ABC123XYZ"                    # From .p8 filename
APNS_TEAM_ID="DEF456UVW"                   # From Apple Developer account
APNS_KEY_P8="LS0tLS1CRUdJTi..."            # Base64 string from step 3
APNS_BUNDLE_ID="com.yourcompany.yourapp"   # Your iOS app bundle ID
```

**Important Notes**:
- These credentials are **shared across all iOS apps** using this Convex backend
- `APNS_BUNDLE_ID` can be updated if you have multiple apps (or use wildcard: `com.yourcompany.*`)
- The code in `lib/push.ts` auto-detects production vs development based on `NODE_ENV`

✅ **Backend setup complete!** Now you can integrate any iOS app.

---

### Android Backend Setup

**What**: Add FCM credentials to Convex environment variables
**When**: Once per Convex backend project
**Time**: ~10 minutes

#### Step 1: Create Google Cloud Project

```bash
# Go to: https://console.cloud.google.com
# Click "Create Project"
# Name: "your-app-push" (or match your app name)
# Note the Project ID (e.g., "your-app-push-123456")
```

#### Step 2: Enable FCM API

```bash
# In Google Cloud Console:
# APIs & Services → Library
# Search "Firebase Cloud Messaging API"
# Click "Enable"
```

#### Step 3: Create Service Account

```bash
# In Google Cloud Console:
# IAM & Admin → Service Accounts
# Click "Create Service Account"
# Name: "fcm-sender"
# Role: "Firebase Cloud Messaging API Admin"
# Click "Create Key" → JSON
# Download the JSON file (e.g., service-account-key.json)
```

#### Step 4: Minify JSON to Single Line

```bash
# In terminal:
cat service-account-key.json | jq -c '.'

# Or use online tool: https://codebeautify.org/jsonminifier
# Copy the entire minified JSON (starts with {"type":"service_account",...})
```

#### Step 5: Add Environment Variables to Convex Dashboard

```bash
# Convex Dashboard → Your Project → Settings → Environment Variables
# Add these 2 variables:

GOOGLE_CLOUD_PROJECT_ID="your-app-push-123456"  # From step 1
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"..."}'  # Entire minified JSON
```

**Important Notes**:
- These credentials are **shared across all Android apps** using this Convex backend
- No need for Firebase Console - we use Google Cloud only
- The service account JSON contains your private key - keep it secure

✅ **Backend setup complete!** Now you can integrate any Android app.

---

## App Setup (Once Per Mobile App)

### iOS App Integration

**What**: Add code to request permissions and register device tokens
**When**: Once per iOS app (repeat for each app connecting to your backend)
**Time**: ~5 minutes

**Requirements**:
- Backend APNs credentials already configured (see Backend Setup above)
- Xcode project with Push Notifications capability enabled

#### Step 1: Enable Push Notifications Capability

```bash
# In Xcode:
# 1. Select your app target
# 2. Go to "Signing & Capabilities" tab
# 3. Click "+" button
# 4. Add "Push Notifications" capability
```

#### Step 2: Create AppDelegate.swift

**File: AppDelegate.swift**

```swift
import UIKit
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
    ) -> Bool {
        // Set delegate
        UNUserNotificationCenter.current().delegate = self

        // Request notification permission
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    application.registerForRemoteNotifications()
                }
            }
        }

        return true
    }

    // Receive device token
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("APNs Device Token: \(tokenString)")

        // Register with your Convex backend
        Task {
            await registerDeviceToken(tokenString)
        }
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("Failed to register for remote notifications: \(error)")
    }
}

// Handle foreground notifications
extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }

    // Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        // Extract custom data for navigation
        if let messageId = userInfo["messageId"] as? String {
            print("User tapped notification for message: \(messageId)")
            // Navigate to message screen using your router
        }

        completionHandler()
    }
}

// Register token with Convex
func registerDeviceToken(_ token: String) async {
    let convexURL = "YOUR_CONVEX_URL" // e.g., https://happy-animal-123.convex.cloud
    let url = URL(string: "\(convexURL)/api/mutation")!

    let payload: [String: Any] = [
        "path": "app/notifications/mutations:registerDeviceToken",
        "args": [
            "token": token,
            "platform": "apns",
            "deviceInfo": [
                "model": UIDevice.current.model,
                "os": "iOS",
                "osVersion": UIDevice.current.systemVersion
            ]
        ],
        "format": "json"
    ]

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try? JSONSerialization.data(withJSONObject: payload)

    do {
        let (_, response) = try await URLSession.shared.data(for: request)
        if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
            print("✅ Device token registered with Convex")
        }
    } catch {
        print("❌ Failed to register device token: \(error)")
    }
}
```

#### Step 3: Add AppDelegate to Your App

**File: YourApp.swift**

```swift
import SwiftUI

@main
struct YourApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

✅ **iOS app integration complete!** Your app will now:
- Request notification permission on launch
- Register device token with Convex backend
- Receive push notifications from your backend

**Testing**: Build and run your app → Accept notification permission → Check Convex Dashboard → Query `deviceTokens` table to verify registration.

---

### Android App Integration

**What**: Add code to request permissions and register device tokens
**When**: Once per Android app (repeat for each app connecting to your backend)
**Time**: ~7 minutes

**Requirements**:
- Backend FCM credentials already configured (see Backend Setup above)
- Android Studio project

#### Step 1: Add Dependencies

**File: build.gradle.kts (app module)**

```kotlin
dependencies {
    // Google Play Services for FCM token
    implementation("com.google.android.gms:play-services-base:18.3.0")
    implementation("com.google.android.gms:play-services-tasks:18.1.0")

    // For HTTP requests to Convex (or use Retrofit/other)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
```

#### Step 2: Get FCM Token and Register with Convex

**File: MainActivity.kt**
```kotlin
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.messaging.FirebaseMessaging

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request notification permission (Android 13+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                1
            )
        }

        // Get FCM token
        FirebaseMessaging.getInstance().token.addOnCompleteListener(OnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM token failed", task.exception)
                return@OnCompleteListener
            }

            val token = task.result
            Log.d(TAG, "FCM Token: $token")

            // Register with Convex
            registerDeviceToken(token)
        })
    }
}

fun registerDeviceToken(token: String) {
    val url = "https://your-convex-url.convex.cloud/api/mutation"

    // Use OkHttp to POST to Convex
    // Same payload structure as iOS example above
    // Include: token, platform: "fcm", deviceInfo
}
```

#### Step 3: Handle Incoming Notifications

**File: MyFirebaseMessagingService.kt**
```kotlin
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        remoteMessage.notification?.let {
            showNotification(it.title, it.body, remoteMessage.data)
        }
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "New FCM token: $token")
        registerDeviceToken(token)
    }

    private fun showNotification(title: String?, body: String?, data: Map<String, String>) {
        // Create notification using NotificationManager
        // Create notification channel, set icon, show notification
    }
}
```

#### Step 4: Update AndroidManifest.xml

**File: AndroidManifest.xml**
```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application>
        <service
            android:name=".MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>
```

✅ **Android app integration complete!** Your app will now:
- Request notification permission on launch (Android 13+)
- Register FCM token with Convex backend
- Receive push notifications from your backend

**Testing**: Build and run your app → Accept notification permission → Check Convex Dashboard → Query `deviceTokens` table to verify registration.

---

## Sending Push Notifications

### From Your Convex Backend

Once backend setup and app integration are complete, send push notifications from any Convex function:

```typescript
// From workflow, cron, webhook, or any internal action
import { internal } from './_generated/api';

await ctx.runAction(internal.app.notifications.internal.sendPush, {
  userId: user._id,
  title: "New Message",
  body: "You have a new message from Alice",
  data: { messageId: "msg_123", chatId: "chat_456" },  // Custom data for deep linking
  badge: 5,                                             // iOS only - app icon badge count
  imageUrl: "https://example.com/avatar.jpg",           // Android only - notification image
});

// Returns: { sent: 2, failed: 0, total: 2 }
```

The backend automatically:
- ✅ Looks up all device tokens for the user
- ✅ Sends to APNs for iOS devices
- ✅ Sends to FCM for Android devices
- ✅ Handles errors and returns delivery stats

---

### Testing Push Notifications

#### Test iOS Push

```typescript
// In Convex dashboard → Functions → internal.app.notifications.internal.sendPush

// Args:
{
  "userId": "j57abc123", // Your test user ID
  "title": "Test iOS Push",
  "body": "This is a test notification",
  "badge": 1
}

// Expected result:
// { "sent": 1, "failed": 0, "total": 1 }
```

#### Test Android Push

```typescript
// Same function, auto-detects platform

{
  "userId": "j57abc123",
  "title": "Test Android Push",
  "body": "This is a test notification",
  "imageUrl": "https://example.com/image.png"  // Optional
}
```

---

### Environment Variables Summary

#### Required for iOS Push

```bash
APNS_KEY_ID="ABC123XYZ"
APNS_TEAM_ID="DEF456UVW"
APNS_KEY_P8="LS0tLS1CRUdJTi..."
APNS_BUNDLE_ID="com.yourcompany.yourapp"
```

#### Required for Android Push

```bash
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

---

## Best Practices

### Notification System

1. **Define notification types as constants** - Avoid magic strings
2. **Check preferences** - System auto-checks, but be mindful
3. **Provide links** - Always include a `link` for navigation
4. **Use icons** - Add visual context with icon names/URLs
5. **Batch operations** - Use `bulkCreate` for multiple users
6. **Clean up old notifications** - Implement cron job to archive/delete

### Push Notifications

1. **Test on real devices** - Simulators don't support push
2. **Handle errors gracefully** - Device tokens can expire
3. **Use data payloads** - Include IDs for deep linking
4. **Badge counts (iOS)** - Keep track of unread count
5. **Rich notifications (Android)** - Use images when relevant
6. **Monitor delivery** - Check Convex logs for errors

### Performance

1. **Index usage** - All queries use indexes (already implemented)
2. **Pagination** - Use `limit` and `offset` for large lists
3. **Real-time updates** - Convex subscriptions are automatic
4. **Background jobs** - Use workflows for bulk notifications

---

## Troubleshooting

### In-App Notifications

**Notifications not showing up**
- Check user preferences: `getPreferences` query
- Verify notification was created: Check `activities` table in Convex dashboard
- Ensure user is authenticated

**High unread count**
- Implement auto-mark-read on page view
- Add archive/dismiss functionality in UI

### iOS Push

**"BadDeviceToken" error**
- Cause: Using production APNs URL with development token (or vice versa)
- Fix: Update `lib/push.ts` to use correct endpoint (sandbox vs production)

**"InvalidProviderToken" error**
- Cause: JWT expired or Key ID/Team ID mismatch
- Fix: Verify `APNS_KEY_ID` matches .p8 filename and `APNS_TEAM_ID` is correct

**Notifications not showing**
- Check notification permissions in iOS Settings
- Verify device token is registered in `deviceTokens` table
- Ensure bundle ID matches `APNS_BUNDLE_ID`

### Android Push

**"Requested entity was not found"**
- Cause: FCM API not enabled in Google Cloud Console
- Fix: Go to APIs & Services → Library → Enable "Firebase Cloud Messaging API"

**"Permission denied"**
- Cause: Service account lacks proper role
- Fix: Ensure service account has "Firebase Cloud Messaging API Admin" role

**Notifications not showing**
- Check notification permissions (Android 13+)
- Verify notification channel is created
- Check device token is registered in `deviceTokens` table

---

## Cost Breakdown

| Service | Free Tier | Paid | Notes |
|---------|-----------|------|-------|
| **APNs** (iOS) | Unlimited | FREE | Requires Apple Developer ($99/year) |
| **FCM** (Android) | Unlimited | FREE | Google Cloud project (free) |
| **Convex** | Generous free tier | Pay as you grow | Notifications are just DB records |
| **OneSignal** (alternative) | 10k subscribers | $9/mo+ | Simpler setup, less control |

**Recommendation**: Use APNs + FCM directly (our implementation). Zero ongoing cost.

---

## Alternative Solutions

### Option 1: OneSignal
- Single API for iOS + Android
- Free tier: 10,000 subscribers
- Paid: $9/month+
- Setup: 5 minutes (just add SDK)
- [OneSignal Docs](https://documentation.onesignal.com/docs/onboarding-with-onesignal)

### Option 2: Expo Push (React Native only)
- Free, unlimited
- Only works with Expo apps (React Native)
- Not compatible with native Swift/Kotlin apps
- [Expo Push Docs](https://docs.expo.dev/push-notifications/overview/)

**TurboKit uses**: APNs + FCM direct (zero cost, full control)

---

## Summary

### What You Need to Do for Each

#### For Each New Convex Backend Project (TurboKit-based)

**In-app notifications**: ✅ Zero setup, works immediately

**iOS push notifications**:
1. Generate APNs auth key (.p8 file) from Apple Developer
2. Convert .p8 to base64
3. Add 4 environment variables to Convex Dashboard
4. Time: ~10 minutes

**Android push notifications**:
1. Create Google Cloud project
2. Enable FCM API
3. Create service account and download JSON
4. Add 2 environment variables to Convex Dashboard
5. Time: ~10 minutes

#### For Each iOS App Connecting to Your Backend

1. Enable Push Notifications capability in Xcode
2. Add AppDelegate code (request permissions, register token with Convex)
3. Add AppDelegate to your App struct
4. Time: ~5 minutes per app

**Required**: Backend APNs credentials must be configured first

#### For Each Android App Connecting to Your Backend

1. Add FCM dependencies to build.gradle
2. Add MainActivity code (request permissions, get FCM token, register with Convex)
3. Create FirebaseMessagingService to handle notifications
4. Update AndroidManifest.xml
5. Time: ~7 minutes per app

**Required**: Backend FCM credentials must be configured first

---

### Files in TurboKit Template (You Never Modify)

- `packages/backend/convex/lib/push.ts` - Core APNs/FCM implementation
- `packages/backend/convex/app/notifications/{queries,mutations,internal}.ts` - Notification functions
- `packages/backend/convex/schema.ts` - Database tables (notifications, deviceTokens, preferences)

**The backend code is complete** - you just configure credentials and integrate apps.

---

### Quick Checklist

**For each new project:**
- [ ] Backend: Add APNs env vars to Convex (if using iOS)
- [ ] Backend: Add FCM env vars to Convex (if using Android)

**For each iOS app:**
- [ ] Enable Push Notifications capability in Xcode
- [ ] Add AppDelegate.swift code
- [ ] Test: Build app, accept permissions, verify token in Convex

**For each Android app:**
- [ ] Add dependencies to build.gradle
- [ ] Add MainActivity.kt code
- [ ] Create MyFirebaseMessagingService.kt
- [ ] Update AndroidManifest.xml
- [ ] Test: Build app, accept permissions, verify token in Convex

**Send notification:**
```typescript
await ctx.runAction(internal.app.notifications.internal.sendPush, {
  userId: user._id,
  title: "Test",
  body: "Push notification test",
});
```

---

## Key Files Reference

- **Backend implementation**: `packages/backend/convex/lib/push.ts`
- **Notification functions**: `packages/backend/convex/app/notifications/`
- **Environment variables**: `/ENV_VARS_GUIDE.md` (root of repo)
- **Frontend components**: `apps/app/src/components/notifications/`
- **Schema**: `packages/backend/convex/schema.ts`

---

## Related Documentation

- iOS APNs: https://developer.apple.com/documentation/usernotifications
- Android Notifications: https://developer.android.com/develop/ui/views/notifications
- FCM HTTP v1 API: https://firebase.google.com/docs/cloud-messaging/migrate-v1
- Convex Workflows: https://docs.convex.dev/production/workflows
