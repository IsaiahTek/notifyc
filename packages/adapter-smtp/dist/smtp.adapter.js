"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpProvider = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class SmtpProvider {
    constructor({ host, port, user, pass, fromEmail }) {
        this.name = 'email';
        this.fromEmail = fromEmail;
        console.log(`[SMTP] Initializing SmtpProvider for ${host}:${port} (from: ${fromEmail})`);
        this.transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
    }
    async sendBatch(notifications, preferences) {
        return Promise.all(notifications.map(notification => this.send(notification, preferences)));
    }
    canSend(notification, preferences) {
        const email = this.resolveEmail(notification, preferences);
        return !!email && this.isValidEmail(email);
    }
    async send(notification, preferences) {
        try {
            const email = this.resolveEmail(notification, preferences);
            if (!email) {
                console.error('[SMTP] Recipient email address not found');
                throw new Error('Recipient email address not found');
            }
            console.log(`[SMTP] Attempting to send email via SMTP to: ${email}`);
            const info = await this.transporter.sendMail({
                from: this.fromEmail,
                to: email,
                subject: notification.title,
                text: notification.text || notification.body,
                html: notification.html || notification.body,
            });
            console.log(`[SMTP] Email sent successfully. MessageID: ${info.messageId}`);
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
    resolveEmail(notification, preferences) {
        // 1. Check notification data
        if (notification.data?.email && typeof notification.data.email === 'string') {
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
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    async healthCheck() {
        try {
            await this.transporter.verify();
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.SmtpProvider = SmtpProvider;
