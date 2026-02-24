"use strict";
// ============================================================================
// API CLIENT
// ============================================================================
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationApiClient = void 0;
var NotificationApiClient = /** @class */ (function () {
    function NotificationApiClient(config) {
        var _this = this;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.handleSSEMessage = function (eventType, onMessage) { return function (event) {
            var _a;
            var parsedData = event.data;
            if (typeof event.data === 'string') {
                try {
                    parsedData = JSON.parse(event.data);
                }
                catch (_b) {
                    parsedData = { data: event.data };
                }
            }
            var normalized = parsedData && typeof parsedData === 'object'
                ? __assign(__assign({}, parsedData), { type: (_a = parsedData.type) !== null && _a !== void 0 ? _a : eventType }) : { type: eventType, data: parsedData };
            _this.handleMessage(normalized, onMessage);
        }; };
        // Helper function to process messages (optional, based on your original logic)
        this.handleMessage = function (data, onMessage) {
            if (data.notification) {
                data.notification = _this.parseNotificationDates(data.notification);
            }
            if (Array.isArray(data.notifications)) {
                data.notifications = data.notifications.map(function (notification) { return _this.parseNotificationDates(notification); });
            }
            onMessage(data);
        };
        this.config = config;
    }
    NotificationApiClient.prototype.request = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options) {
            var token, _a, response;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.config.getAuthToken) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.config.getAuthToken()];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = null;
                        _b.label = 3;
                    case 3:
                        token = _a;
                        return [4 /*yield*/, fetch("".concat(this.config.apiUrl).concat(endpoint), __assign(__assign({}, options), { credentials: 'include', headers: __assign(__assign({ 'Content-Type': 'application/json' }, (token && { Authorization: "Bearer ".concat(token) })), options.headers) }))];
                    case 4:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("API Error: ".concat(response.statusText));
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    NotificationApiClient.prototype.getNotifications = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var params, query, rawNotifications, notifications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams();
                        if (filters === null || filters === void 0 ? void 0 : filters.status) {
                            params.append('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.type) {
                            params.append('type', Array.isArray(filters.type) ? filters.type.join(',') : filters.type);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.limit)
                            params.append('limit', filters.limit.toString());
                        if (filters === null || filters === void 0 ? void 0 : filters.offset)
                            params.append('offset', filters.offset.toString());
                        query = params.toString() ? "?".concat(params.toString()) : '';
                        return [4 /*yield*/, this.request("/notifications/".concat(this.config.userId).concat(query))];
                    case 1:
                        rawNotifications = _a.sent();
                        notifications = this.config.dataLocator ? this.config.dataLocator(rawNotifications) : rawNotifications;
                        // Parse date strings to Date objects
                        return [2 /*return*/, Array.isArray(notifications) ? notifications.map(this.parseNotificationDates) : [this.parseNotificationDates(notifications)]];
                }
            });
        });
    };
    NotificationApiClient.prototype.getUnreadCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rawResult, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/notifications/".concat(this.config.userId, "/unread-count"))];
                    case 1:
                        rawResult = _a.sent();
                        result = this.config.dataLocator ? this.config.dataLocator(rawResult) : rawResult;
                        console.log("GOT UNREAD COUNT IN API: ", result.count, result);
                        return [2 /*return*/, result.count];
                }
            });
        });
    };
    NotificationApiClient.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/notifications/".concat(this.config.userId, "/stats"))];
            });
        });
    };
    NotificationApiClient.prototype.getPreferences = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/notifications/".concat(this.config.userId, "/preferences"))];
                    case 1:
                        prefs = _a.sent();
                        return [2 /*return*/, prefs];
                }
            });
        });
    };
    NotificationApiClient.prototype.markAsRead = function (notificationId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/notifications/".concat(this.config.userId, "/").concat(notificationId, "/read"), { method: 'POST' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotificationApiClient.prototype.markAllAsRead = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/notifications/".concat(this.config.userId, "/read-all"), { method: 'POST' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotificationApiClient.prototype.deleteNotification = function (notificationId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/notifications/".concat(this.config.userId, "/").concat(notificationId), { method: 'DELETE' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotificationApiClient.prototype.deleteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/notifications/".concat(this.config.userId, "/all"), { method: 'DELETE' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotificationApiClient.prototype.updatePreferences = function (prefs) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request("/notifications/".concat(this.config.userId, "/preferences"), {
                            method: 'PUT',
                            body: JSON.stringify(prefs)
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotificationApiClient.prototype.connectSSE = function (onMessage) {
        var _this = this;
        var _a, _b;
        if (typeof EventSource === 'undefined')
            return false;
        var base = ((_a = this.config.sseUrl) !== null && _a !== void 0 ? _a : this.config.apiUrl).replace(/\/+$/, '');
        var configuredPath = (_b = this.config.ssePath) !== null && _b !== void 0 ? _b : '/notifications/:userId/stream';
        var normalizedPath = configuredPath.startsWith('/') ? configuredPath : "/".concat(configuredPath);
        var resolvedPath = normalizedPath.replace(':userId', encodeURIComponent(this.config.userId));
        var streamUrl = "".concat(base).concat(resolvedPath);
        this.sse = new EventSource(streamUrl, { withCredentials: true });
        this.sse.onopen = function () {
            console.log('🔌 SSE connected');
            _this.reconnectAttempts = 0;
        };
        this.sse.addEventListener('initial-data', this.handleSSEMessage('initial-data', onMessage));
        this.sse.addEventListener('notification', this.handleSSEMessage('notification', onMessage));
        this.sse.addEventListener('unread-count', this.handleSSEMessage('unread-count', onMessage));
        this.sse.onerror = function (error) {
            console.error('❌ SSE error:', error);
        };
        return true;
    };
    NotificationApiClient.prototype.connectWebSocket = function (onMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var socketIO, io, token, _a, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.config.wsUrl)
                            return [2 /*return*/, false];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('socket.io-client'); })];
                    case 2:
                        socketIO = _b.sent();
                        io = socketIO.io;
                        if (!this.config.getAuthToken) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.config.getAuthToken()];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = null;
                        _b.label = 5;
                    case 5:
                        token = _a;
                        this.ws = io(this.config.wsUrl, __assign(__assign({ query: {
                                userId: this.config.userId,
                            } }, (token && { auth: { token: token } })), { withCredentials: true, transports: ['websocket', 'polling'], reconnectionAttempts: this.maxReconnectAttempts }));
                        this.ws.on('connect', function () {
                            console.log('🔌 WebSocket connected');
                            _this.reconnectAttempts = 0;
                        });
                        this.ws.on('initial-data', function (data) { return _this.handleMessage(data, onMessage); });
                        this.ws.on('notification', function (data) { return _this.handleMessage(data, onMessage); });
                        this.ws.on('unread-count', function (data) { return _this.handleMessage(data, onMessage); });
                        this.ws.on('error', function (error) {
                            console.error('❌ Socket.IO error:', error);
                        });
                        this.ws.on('disconnect', function (reason) {
                            console.log("\uD83D\uDD0C Socket.IO disconnected. Reason: ".concat(reason));
                        });
                        return [2 /*return*/, true];
                    case 6:
                        error_1 = _b.sent();
                        console.error('Failed to initialize socket.io-client. Falling back from WebSocket transport.', error_1);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    NotificationApiClient.prototype.disconnectWebSocket = function () {
        if (this.sse) {
            this.sse.close();
            this.sse = undefined;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    };
    NotificationApiClient.prototype.startPolling = function (onPoll) {
        var _this = this;
        if (!this.config.pollInterval)
            return;
        this.pollInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, onPoll()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Polling error:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, this.config.pollInterval);
    };
    NotificationApiClient.prototype.stopPolling = function () {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = undefined;
        }
    };
    NotificationApiClient.prototype.parseNotificationDates = function (notification) {
        return __assign(__assign({}, notification), { createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date(), readAt: notification.readAt ? new Date(notification.readAt) : undefined, scheduledFor: notification.scheduledFor ? new Date(notification.scheduledFor) : undefined, expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined });
    };
    return NotificationApiClient;
}());
exports.NotificationApiClient = NotificationApiClient;
