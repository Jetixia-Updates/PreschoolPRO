import { prisma } from "./prisma";
import { NotificationType } from "@prisma/client";

/**
 * Create and send a notification to a user
 */
export async function sendNotification({
  userId,
  type,
  title,
  message,
  data,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data || {},
    },
  });

  // In production, you'd also emit a WebSocket/Pusher event here:
  // await pusher.trigger(`user-${userId}`, 'notification', notification);

  return notification;
}

/**
 * Send notification to multiple users
 */
export async function sendBulkNotification({
  userIds,
  type,
  title,
  message,
  data,
}: {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  const notifications = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      data: data || {},
    })),
  });

  return notifications;
}

/**
 * Send notification to all users with a specific role
 */
export async function sendRoleNotification({
  schoolId,
  role,
  type,
  title,
  message,
  data,
}: {
  schoolId: string;
  role: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  const users = await prisma.user.findMany({
    where: {
      schoolId,
      role: role as any,
      isActive: true,
    },
    select: { id: true },
  });

  return sendBulkNotification({
    userIds: users.map((u) => u.id),
    type,
    title,
    message,
    data,
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark notifications as read
 */
export async function markAsRead(notificationIds: string[]) {
  return prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Notification templates
 */
export const NotificationTemplates = {
  newEnrollment: (studentName: string) => ({
    type: "ALERT" as NotificationType,
    title: "New Student Enrolled",
    message: `${studentName} has been enrolled in the school.`,
  }),

  dailyReportReady: (studentName: string) => ({
    type: "REPORT" as NotificationType,
    title: "Daily Report Ready",
    message: `Today's daily report for ${studentName} is ready to view.`,
  }),

  newMessage: (senderName: string) => ({
    type: "MESSAGE" as NotificationType,
    title: "New Message",
    message: `You have a new message from ${senderName}.`,
  }),

  paymentReminder: (amount: number, dueDate: string) => ({
    type: "REMINDER" as NotificationType,
    title: "Payment Reminder",
    message: `Payment of $${amount.toFixed(2)} is due on ${dueDate}.`,
  }),

  developmentAlert: (studentName: string, domain: string) => ({
    type: "ALERT" as NotificationType,
    title: "Development Alert",
    message: `${studentName} may need additional support in ${domain}.`,
  }),

  vaccinationReminder: (studentName: string, vaccineName: string) => ({
    type: "REMINDER" as NotificationType,
    title: "Vaccination Reminder",
    message: `${vaccineName} vaccination is due for ${studentName}.`,
  }),

  eventReminder: (eventTitle: string, eventDate: string) => ({
    type: "REMINDER" as NotificationType,
    title: "Upcoming Event",
    message: `"${eventTitle}" is scheduled for ${eventDate}.`,
  }),

  incidentReport: (studentName: string) => ({
    type: "ALERT" as NotificationType,
    title: "Incident Report",
    message: `An incident report has been filed for ${studentName}.`,
  }),
};
