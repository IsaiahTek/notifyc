import nodemailer from 'nodemailer';
import { DeliveryReceipt, TransportAdapter, ChannelType, NotificationPreferences, EmailNotification } from '@notifyc/core';

export class SmtpProvider implements TransportAdapter {
  private transporter;
  name: ChannelType = 'email';

  constructor(
    host: string,
    port: number,
    user: string,
    pass: string,
    private fromEmail: string
  ) {
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendBatch(notifications: EmailNotification[], preferences: NotificationPreferences): Promise<DeliveryReceipt[]> {
    return Promise.all(
      notifications.map(notification => this.send(notification, preferences))
    );
  }

  canSend(notification: EmailNotification, preferences: NotificationPreferences): boolean {
    const email = this.resolveEmail(notification, preferences);
    return !!email && this.isValidEmail(email);
  }

  async send(notification: EmailNotification, preferences: NotificationPreferences): Promise<DeliveryReceipt> {
    try {
      const email = this.resolveEmail(notification, preferences);
      if (!email) {
        throw new Error('Recipient email address not found');
      }

      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: notification.title,
        text: notification.text || notification.body,
        html: notification.html || notification.body,
      });

      return {
        notificationId: notification.id,
        channel: 'email',
        status: 'sent',
        attempts: 1,
        lastAttempt: new Date(),
        metadata: {
          messageId: info.messageId,
        },
      };
    } catch (error: any) {
      return {
        notificationId: notification.id,
        channel: 'email',
        status: 'failed',
        attempts: 1,
        lastAttempt: new Date(),
        error: error.message,
      };
    }
  }

  private resolveEmail(notification: EmailNotification, preferences?: NotificationPreferences): string | undefined {
    // 1. Check notification data
    if (notification.data.email && typeof notification.data.email === 'string') {
      return notification.data.email;
    }

    // 2. Check user preferences
    if (preferences?.data?.email && typeof preferences.data.email === 'string') {
      return preferences.data.email;
    }

    // 3. Fallback to userId if it looks like an email
    if (this.isValidEmail(notification.userId)) {
      return notification.userId;
    }

    return undefined;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}