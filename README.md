# NotifyC 🔔

NotifyC is a powerful, flexible, and framework-agnostic notification system designed to unify all your communication channels (In-App, Push, Email, SMS, and Webhooks) into a single, cohesive workflow.

## 🚀 The Ecosystem

The NotifyC ecosystem consists of several packages designed to work together or independently:

- [**NotifyC Core**](./packages/core) (`@notifyc/core`): The heart of the system. Framework-agnostic logic for dispatching, templates, and middleware.
- [**NotifyC NestJS**](./packages/nestjs) (`@notifyc/nestjs`): A seamless wrapper for NestJS applications with built-in WebSocket gateways and REST APIs.
- [**NotifyC Adapters**](./packages/adapter-smtp): Collection of transport and storage adapters (SMTP, SendGrid, FCM, Twilio, Postgres).
- [**NotifyC React**](./packages/react) (`@notifyc/react`): Frontend hooks and providers for React/Next.js to receive real-time notifications.

## ✨ Key Features

- 🎯 **Unified API** - Send notifications to any channel using a single interface.
- 🎨 **Dynamic Templating** - Handle complex notification layouts with ease.
- ⚡ **Real-time Delivery** - Built-in support for WebSockets and SSE.
- 🗄️ **Pluggable Storage** - Persistent notification history with your choice of database.
- 🔌 **Extensible Adapters** - Easily swap or add new transport providers.
- 🔄 **Middleware Pipeline** - Hook into the notification lifecycle for custom logic.

## 📦 Quick Start (NestJS)

```bash
npm install @notifyc/nestjs @notifyc/core
```

```typescript
import { NotificationsModule } from '@notifyc/nestjs';
import { ConsoleTransportAdapter, MemoryStorageAdapter } from '@notifyc/core';

@Module({
  imports: [
    NotificationsModule.forRoot({
      storage: new MemoryStorageAdapter(),
      transports: [new ConsoleTransportAdapter('email')]
    })
  ]
})
export class AppModule {}
```

## 📖 Deep Dives

- [How it Works](./packages/core/README.md)
- [Integrating with NestJS](./packages/nestjs/README.md)
- [Available Adapters](./packages/adapter-smtp/README.md)
- [Frontend Real-time Updates](./packages/react/README.md)

## 🤝 Contributing

We welcome contributions! Please check out our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

MIT © [Engr., Isaiah Pius E.](https://github.com/IsaiahTek)
