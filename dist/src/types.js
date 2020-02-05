"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Currencies;
(function (Currencies) {
    Currencies["Bitcoin"] = "btc";
})(Currencies = exports.Currencies || (exports.Currencies = {}));
var Networks;
(function (Networks) {
    Networks["Testnet"] = "testnet";
    Networks["Regnet"] = "regnet";
})(Networks = exports.Networks || (exports.Networks = {}));
// debug:
// 0 - no reports to console
// 1 - only error reports to console
// 2 - verbose reporting level
var DebugLevels;
(function (DebugLevels) {
    DebugLevels[DebugLevels["MUTE"] = 0] = "MUTE";
    DebugLevels[DebugLevels["QUIET"] = 1] = "QUIET";
    DebugLevels[DebugLevels["VERBOSE"] = 2] = "VERBOSE";
})(DebugLevels = exports.DebugLevels || (exports.DebugLevels = {}));
var Endpoints;
(function (Endpoints) {
    Endpoints["Collect"] = "collect";
    Endpoints["Inbox"] = "inbox";
    Endpoints["Transfers"] = "transfers";
    Endpoints["Networks"] = "networks";
})(Endpoints = exports.Endpoints || (exports.Endpoints = {}));
// who the service should respond from methods:
// - callback - use provided callback
// - direct - respond directly
var Responses;
(function (Responses) {
    Responses["Callback"] = "callback";
    Responses["Direct"] = "direct";
})(Responses = exports.Responses || (exports.Responses = {}));
var Logger;
(function (Logger) {
    Logger[Logger["Error"] = 0] = "Error";
    Logger[Logger["Info"] = 1] = "Info";
    Logger[Logger["Warning"] = 2] = "Warning";
})(Logger = exports.Logger || (exports.Logger = {}));
var EventTypes;
(function (EventTypes) {
    EventTypes["GET_RETRIEVABLE"] = "service_get_retrievable";
    EventTypes["GET_COLLECTABLES"] = "service_get_collectables";
    EventTypes["UPDATE_STATUS"] = "service_update_status";
    EventTypes["SEND_TRANSACTION"] = "service_send_transaction";
    EventTypes["COLLECT_TRANSACTION"] = "service_collect_transaction";
    EventTypes["UPDATED_RETRIEVABLE"] = "service_updated_retrievable";
    EventTypes["UPDATED_COLLECTABLE"] = "service_updated_collectable";
    EventTypes["REMOVED_COLLECTABLE"] = "service_removed_collectable";
    EventTypes["CREATED_COLLECTABLE"] = "service_created_collectable";
})(EventTypes = exports.EventTypes || (exports.EventTypes = {}));
