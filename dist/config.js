"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiUrl = exports.connectionTimeout = exports.connectionTriesMax = void 0;
exports.connectionTriesMax = 3;
exports.connectionTimeout = process.env.NODE_ENV === 'test' ? 1 : 10;
exports.apiUrl = 'https://api.kirobo.me';
//# sourceMappingURL=config.js.map