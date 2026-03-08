import { DeliveryReceipt, TransportAdapter, ChannelType, NotificationPreferences, EmailNotification } from '@notifyc/core';
export declare class SendGridProvider implements TransportAdapter {
    name: ChannelType;
    private apiKey;
    private fromEmail;
    constructor(apiKey: string, fromEmail: string);
    send(notification: EmailNotification, preferences: NotificationPreferences): Promise<DeliveryReceipt>;
    sendBatch(notifications: EmailNotification[], preferences: NotificationPreferences): Promise<DeliveryReceipt[]>;
    canSend(notification: EmailNotification, preferences: NotificationPreferences): boolean;
    private resolveEmail;
    private isValidEmail;
    healthCheck(): Promise<boolean>;
}
