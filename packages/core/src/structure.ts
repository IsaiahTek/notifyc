// ```

// ### 6. Package Structure
// ```
// packages/
// ├── core/                           # @notifyc/core
// │   ├── src/
// │   │   ├── center.ts              # Main NotificationCenter
// │   │   ├── models/                # Types & interfaces
// │   │   ├── adapters/              # Base adapter interfaces
// │   │   ├── queue/                 # Queue abstraction
// │   │   ├── middleware/            # Built-in middleware
// │   │   └── utils/                 # Helpers
// │   └── package.json
// │
// ├── storage-adapters/
// │   ├── memory/                    # @notifyc/storage-memory
// │   ├── postgres/                  # @notifyc/adapter-postgres
// │   ├── mongodb/                   # @notifyc/storage-mongodb
// │   ├── firestore/                 # @notifyc/storage-firestore
// │   └── rest/                      # @notifyc/storage-rest
// │
// ├── transport-adapters/
// │   ├── email/                     # @notifyc/adapter-smtp
// │   ├── push/                      # @notifyc/transport-push
// │   ├── sms/                       # @notifyc/transport-sms
// │   ├── webhook/                   # @notifyc/transport-webhook
// │   └── inapp/                     # @notifyc/transport-inapp
// │
// ├── queue-adapters/
// │   ├── memory/                    # @notifyc/queue-memory
// │   ├── redis/                     # @notifyc/queue-redis
// │   └── bullmq/                    # @notifyc/queue-bullmq
// │
// ├── bindings/
// │   ├── react/                     # @notifyc/react
// │   ├── vue/                       # @notifyc/vue
// │   ├── nestjs/                    # @notifyc/nestjs
// │   ├── express/                   # @notifyc/express
// │   └── flutter/                   # synq_notifications (Dart)
// │
// └── middleware/
//     ├── rate-limit/                # @notifyc/middleware-rate-limit
//     ├── deduplication/             # @notifyc/middleware-dedupe
//     └── analytics/                 # @notifyc/middleware-analytics