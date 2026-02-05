import { db } from "../db";
import { eq } from "drizzle-orm";
import { profiles, teenProfiles } from "@shared/schema";
import type { SafetyAlert } from "@shared/schema";

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushNotificationTarget {
  userId: string;
  pushToken?: string | null;
}

async function getPushTokenForUser(userId: string): Promise<string | null> {
  const result = await db
    .select({ pushToken: profiles.pushToken })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  
  return result[0]?.pushToken || null;
}

export async function sendPushNotification(
  target: PushNotificationTarget,
  payload: PushNotificationPayload
): Promise<boolean> {
  const token = target.pushToken || await getPushTokenForUser(target.userId);
  
  if (!token) {
    console.log(`[Push] No push token for user ${target.userId}, notification skipped:`, payload.title);
    return false;
  }

  console.log(`[Push] Sending notification to user ${target.userId}:`, payload.title, payload.body);
  
  try {
    // Expo Push Notifications API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: 'default',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[Push] Expo API error:`, errorData);
      return false;
    }
    
    const result = await response.json();
    console.log(`[Push] Notification sent successfully:`, result);
    return true;
  } catch (error) {
    console.error(`[Push] Failed to send notification:`, error);
    return false;
  }
}

export async function notifyTeenOfAlert(
  teenProfileId: string,
  alert: SafetyAlert
): Promise<void> {
  try {
    const teenProfileData = await db
      .select({ userId: profiles.userId, pushToken: profiles.pushToken })
      .from(teenProfiles)
      .innerJoin(profiles, eq(profiles.id, teenProfiles.profileId))
      .where(eq(teenProfiles.id, teenProfileId))
      .limit(1);

    if (teenProfileData.length === 0) return;

    const { userId, pushToken } = teenProfileData[0];

    await sendPushNotification(
      { userId, pushToken },
      {
        title: "Health Check Alert",
        body: alert.message.substring(0, 100) + (alert.message.length > 100 ? "..." : ""),
        data: { alertId: alert.id, alertType: alert.alertType },
      }
    );
  } catch (error) {
    console.error("[Push] Error notifying teen:", error);
  }
}

export async function notifyOfNewAlerts(
  teenProfileId: string,
  alerts: SafetyAlert[]
): Promise<void> {
  for (const alert of alerts) {
    await notifyTeenOfAlert(teenProfileId, alert);
  }
}
