"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTime = exports.diff = void 0;
function diff(prev, now) {
    if (!prev)
        return 100;
    const nowDate = () => (now ? new Date(now).getTime() : new Date().getTime());
    return Math.round((nowDate() - new Date(prev).getTime()) / 1000);
}
exports.diff = diff;
function getTime() {
    return new Date().valueOf();
}
exports.getTime = getTime;
//# sourceMappingURL=time.js.map