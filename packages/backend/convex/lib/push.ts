"use node";

/**
 * Mobile Push Notifications - No Firebase Platform Required
 *
 * Uses:
 * - FCM HTTP v1 API for Android (via Google Cloud service account)
 * - APNs HTTP/2 API for iOS
 *
 * Setup:
 * 1. Android: Create Google Cloud project, enable FCM API, download service account JSON
 * 2. iOS: Generate APNs auth key from Apple Developer Console
 */

import { GoogleAuth } from "google-auth-library";

// ============================================================================
// ANDROID: FCM HTTP v1 API (No Firebase Platform)
// ============================================================================

interface FCMMessage {
	token: string;
	title: string;
	body: string;
	data?: Record<string, string>;
	imageUrl?: string;
}

export interface PushSendResult {
	success: boolean;
	reason?: string;
	statusCode?: number;
}

/**
 * Send push notification to Android device via FCM HTTP v1 API
 * Requires: GOOGLE_CLOUD_PROJECT_ID and GOOGLE_SERVICE_ACCOUNT_JSON env vars
 */
export async function sendFCMNotification(
	message: FCMMessage,
): Promise<PushSendResult> {
	const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
	const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

	if (!projectId || !serviceAccountJson) {
		console.error(
			"[FCM] Missing GOOGLE_CLOUD_PROJECT_ID or GOOGLE_SERVICE_ACCOUNT_JSON",
		);
		return {
			success: false,
			reason: "missing-fcm-config",
		};
	}

	try {
		// Get OAuth2 access token from service account
		const auth = new GoogleAuth({
			credentials: JSON.parse(serviceAccountJson),
			scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
		});

		const accessToken = await auth.getAccessToken();

		// FCM HTTP v1 endpoint
		const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

		const payload = {
			message: {
				token: message.token,
				notification: {
					title: message.title,
					body: message.body,
					...(message.imageUrl && { image: message.imageUrl }),
				},
				data: message.data || {},
				android: {
					priority: "high",
					notification: {
						sound: "default",
						click_action: "FLUTTER_NOTIFICATION_CLICK",
					},
				},
			},
		};

		const response = await fetch(fcmUrl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error("[FCM] Send failed:", error);
			return {
				success: false,
				reason: error,
				statusCode: response.status,
			};
		}

		console.log("[FCM] Notification sent successfully");
		return {
			success: true,
		};
	} catch (error) {
		console.error("[FCM] Error:", error);
		return {
			success: false,
			reason: error instanceof Error ? error.message : "fcm-send-failed",
		};
	}
}

// ============================================================================
// iOS: APNs HTTP/2 API
// ============================================================================

interface APNsMessage {
	token: string;
	title: string;
	body: string;
	data?: Record<string, string>;
	badge?: number;
}

/**
 * Send push notification to iOS device via APNs HTTP/2 API
 * Requires: APNS_KEY_ID, APNS_TEAM_ID, APNS_KEY_P8 env vars
 */
export async function sendAPNsNotification(
	message: APNsMessage,
): Promise<PushSendResult> {
	const keyId = process.env.APNS_KEY_ID;
	const teamId = process.env.APNS_TEAM_ID;
	const keyP8 = process.env.APNS_KEY_P8; // Base64-encoded .p8 file
	const bundleId = process.env.APNS_BUNDLE_ID || "com.yourapp.bundle";

	if (!keyId || !teamId || !keyP8) {
		console.error("[APNs] Missing APNS_KEY_ID, APNS_TEAM_ID, or APNS_KEY_P8");
		return {
			success: false,
			reason: "missing-apns-config",
		};
	}

	try {
		// Generate JWT for APNs authentication
		const jwt = await generateAPNsJWT(keyId, teamId, keyP8);

		// APNs endpoint (use api.sandbox.push.apple.com for development)
		const apnsUrl = `https://api.push.apple.com/3/device/${message.token}`;

		const payload = {
			aps: {
				alert: {
					title: message.title,
					body: message.body,
				},
				sound: "default",
				badge: message.badge,
			},
			...(message.data || {}),
		};

		const response = await fetch(apnsUrl, {
			method: "POST",
			headers: {
				authorization: `bearer ${jwt}`,
				"apns-topic": bundleId,
				"apns-push-type": "alert",
				"apns-priority": "10",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error("[APNs] Send failed:", error);
			return {
				success: false,
				reason: error,
				statusCode: response.status,
			};
		}

		console.log("[APNs] Notification sent successfully");
		return {
			success: true,
		};
	} catch (error) {
		console.error("[APNs] Error:", error);
		return {
			success: false,
			reason: error instanceof Error ? error.message : "apns-send-failed",
		};
	}
}

/**
 * Generate JWT token for APNs authentication
 */
async function generateAPNsJWT(
	keyId: string,
	teamId: string,
	keyP8Base64: string,
): Promise<string> {
	// Decode base64 P8 key
	const keyP8 = Buffer.from(keyP8Base64, "base64").toString("utf-8");

	// Import crypto for JWT signing
	const crypto = await import("node:crypto");

	const header = {
		alg: "ES256",
		kid: keyId,
	};

	const payload = {
		iss: teamId,
		iat: Math.floor(Date.now() / 1000),
	};

	const encodedHeader = base64url(JSON.stringify(header));
	const encodedPayload = base64url(JSON.stringify(payload));
	const token = `${encodedHeader}.${encodedPayload}`;

	// Sign with ES256 (ECDSA with P-256 and SHA-256)
	const sign = crypto.createSign("sha256");
	sign.update(token);
	const signature = sign.sign(keyP8, "base64");

	return `${token}.${base64url(signature)}`;
}

function base64url(input: string | Buffer): string {
	const base64 =
		typeof input === "string"
			? Buffer.from(input).toString("base64")
			: input.toString("base64");

	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
