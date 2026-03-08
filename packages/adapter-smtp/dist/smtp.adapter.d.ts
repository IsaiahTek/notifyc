import { DeliveryReceipt, TransportAdapter, ChannelType, NotificationPreferences, EmailNotification } from '@notifyc/core';
export declare class SmtpProvider implements TransportAdapter {
    private fromEmail;
    private transporter;
    name: ChannelType;
    constructor(host: string, port: number, user: string, pass: string, fromEmail: string);
    sendBatch(notifications: EmailNotification[], preferences: NotificationPreferences): Promise<DeliveryReceipt[]>;
    canSend(notification: EmailNotification, preferences: NotificationPreferences): boolean;
    send(notification: EmailNotification, preferences: NotificationPreferences): Promise<DeliveryReceipt>;
    private resolveEmail;
    private isValidEmail;
    healthCheck(): Promise<boolean>;
}
