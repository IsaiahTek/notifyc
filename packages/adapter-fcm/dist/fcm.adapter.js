"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FcmProvider = void 0;
const admin = __importStar(require("firebase-admin"));
class FcmProvider {
    constructor(app) {
        this.app = app;
        this.name = 'push';
        if (!this.app && admin.apps.length === 0) {
            throw new Error('Firebase Admin SDK not initialized and no app provided.');
        }
    }
    async send(notification, preferences) {
        try {
            const token = this.resolveDeviceToken(notification, preferences);
            if (!token) {
                return {
                    notificationId: notification.id,
                    channel: this.name,
                    status: 'failed',
                    attempts: 1,
                    lastAttempt: new Date(),
                    error: 'No device token found for recipient'
                };
            }
            const message = {
                token,
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: notification.data,
            };
            const response = await (this.app || admin).messaging().send(message);
            return {
                notificationId: notification.id,
                channel: this.name,
                status: 'sent',
                attempts: 1,
                lastAttempt: new Date(),
                metadata: { messageId: response }
            };
        }
        catch (error) {
            return this.handleError(notification.id, error);
        }
    }
    async sendBatch(notifications, preferences) {
        const messages = [];
        const validNotifications = [];
        const receipts = [];
        for (const notification of notifications) {
            const token = this.resolveDeviceToken(notification, preferences);
            if (!token) {
                receipts.push({
                    notificationId: notification.id,
                    channel: this.name,
                    status: 'failed',
                    attempts: 1,
                    lastAttempt: new Date(),
                    error: 'No device token found for recipient'
                });
                continue;
            }
            messages.push({
                token,
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: notification.data,
            });
            validNotifications.push(notification);
        }
        if (messages.length === 0) {
            return receipts;
        }
        try {
            const batchResponse = await (this.app || admin).messaging().sendEach(messages);
            batchResponse.responses.forEach((res, index) => {
                const notification = validNotifications[index];
                if (res.success) {
                    receipts.push({
                        notificationId: notification.id,
                        channel: this.name,
                        status: 'sent',
                        attempts: 1,
                        lastAttempt: new Date(),
                        metadata: { messageId: res.messageId }
                    });
                }
                else {
                    receipts.push(this.handleError(notification.id, res.error ?? new Error('Unknown error')));
                }
            });
        }
        catch (error) {
            // This loop handles the case where the entire batch call fails (e.g. network)
            validNotifications.forEach(notification => {
                receipts.push(this.handleError(notification.id, error));
            });
        }
        return receipts;
    }
    async sendMulticast(notifications, preferences) {
        const receipts = [];
        const contentGroups = new Map();
        for (const notification of notifications) {
            const token = this.resolveDeviceToken(notification, preferences);
            if (!token) {
                receipts.push({
                    notificationId: notification.id,
                    channel: this.name,
                    status: 'failed',
                    attempts: 1,
                    lastAttempt: new Date(),
                    error: 'No device token found for recipient'
                });
                continue;
            }
            // Create a unique key for the notification content to group identical messages
            // Exclude deviceToken from the grouping key as it varies per notification
            const { deviceToken: _, ...groupingData } = notification.data || {};
            const contentKey = JSON.stringify({
                title: notification.title,
                body: notification.body,
                data: groupingData
            });
            if (!contentGroups.has(contentKey)) {
                contentGroups.set(contentKey, {
                    notification: {
                        title: notification.title,
                        body: notification.body,
                    },
                    data: notification.data,
                    tokens: [],
                    originalNotifications: []
                });
            }
            const group = contentGroups.get(contentKey);
            group.tokens.push(token);
            group.originalNotifications.push(notification);
        }
        if (contentGroups.size === 0) {
            return receipts;
        }
        // Process each group of identical messages
        for (const group of contentGroups.values()) {
            try {
                const message = {
                    tokens: group.tokens,
                    notification: group.notification,
                    data: group.data,
                };
                const batchResponse = await (this.app || admin).messaging().sendEachForMulticast(message);
                batchResponse.responses.forEach((res, index) => {
                    const originalNotif = group.originalNotifications[index];
                    if (res.success) {
                        receipts.push({
                            notificationId: originalNotif.id,
                            channel: this.name,
                            status: 'sent',
                            attempts: 1,
                            lastAttempt: new Date(),
                            metadata: { messageId: res.messageId }
                        });
                    }
                    else {
                        receipts.push(this.handleError(originalNotif.id, res.error ?? new Error('Unknown error')));
                    }
                });
            }
            catch (error) {
                // Handle entire multicast call failure
                group.originalNotifications.forEach(notif => {
                    receipts.push(this.handleError(notif.id, error));
                });
            }
        }
        return receipts;
    }
    canSend(notification, preferences) {
        const token = this.resolveDeviceToken(notification, preferences);
        return !!token;
    }
    async healthCheck() {
        try {
            // Check if Firebase is initialized
            const app = this.app || admin.app();
            return !!app;
        }
        catch (error) {
            return false;
        }
    }
    handleError(notificationId, error) {
        // Here we could add logic to classify errors (e.g. retryable vs non-retryable)
        return {
            notificationId,
            channel: this.name,
            status: 'failed',
            attempts: 1,
            lastAttempt: new Date(),
            error: error.message,
            metadata: { errorCode: error.code }
        };
    }
    resolveDeviceToken(notification, preferences) {
        // 1. Check notification data
        if (notification.data?.deviceToken && typeof notification.data.deviceToken === 'string') {
            return notification.data.deviceToken;
        }
        // 2. Check preferences data
        if (preferences?.data?.deviceToken && typeof preferences.data.deviceToken === 'string') {
            return preferences.data.deviceToken;
        }
        return undefined;
    }
}
exports.FcmProvider = FcmProvider;
