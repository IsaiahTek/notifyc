"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridProvider = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
class SendGridProvider {
    constructor(apiKey, fromEmail) {
        this.name = 'email';
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        mail_1.default.setApiKey(this.apiKey);
    }
    async send(notification, preferences) {
        try {
            const email = this.resolveEmail(notification, preferences);
            if (!email) {
                throw new Error('Recipient email address not found');
            }
            const [response] = await mail_1.default.send({
                to: email,
                from: this.fromEmail,
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
                    messageId: response.headers['x-message-id'],
                },
            };
        }
        catch (error) {
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
    async sendBatch(notifications, preferences) {
        // SendGrid supports batch sending, but for simplicity and to match SmtpProvider's behavior/structure, 
        // we can send them individually or use SendGrid's batch if preferred.
        // Given the task, I will implement it by iterating.
        return Promise.all(notifications.map(notification => this.send(notification, preferences)));
    }
    canSend(notification, preferences) {
        const email = this.resolveEmail(notification, preferences);
        return !!email && this.isValidEmail(email);
    }
    resolveEmail(notification, preferences) {
        if (notification.data?.email && typeof notification.data.email === 'string') {
            return notification.data.email;
        }
        if (preferences?.data?.email && typeof preferences.data.email === 'string') {
            return preferences.data.email;
        }
        if (this.isValidEmail(notification.userId)) {
            return notification.userId;
        }
        return undefined;
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    async healthCheck() {
        try {
            // SendGrid doesn't have a simple verify() like nodemailer, but we can try to send a test email to the from address
            // or just assume it's up if the API key is set. For health check, maybe a simple request to SendGrid API.
            // However, to keep it consistent with the previous implementation:
            await mail_1.default.send({
                to: this.fromEmail,
                from: this.fromEmail,
                subject: 'Health Check',
                text: 'Health check',
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.SendGridProvider = SendGridProvider;
