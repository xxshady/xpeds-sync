var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/xpeds-sync/class.ts
import * as alt12 from "alt-client";

// ../../altv-xsync-entity/client/dist/main.js
var main_exports = {};
__export(main_exports, {
  Entity: () => Entity,
  EntityPool: () => EntityPool,
  XSyncEntity: () => XSyncEntity,
  onEntityEvents: () => onEntityEvents
});
import {
  onServer
} from "alt-client";
import alt2 from "alt-shared";
import alt from "alt-shared";
import {
  Player,
  WebSocketClient,
  nextTick
} from "alt-client";
import alt4 from "alt-shared";
import alt3 from "alt-shared";
import {
  getServerIp
} from "alt-client";
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => {
  __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __defProp22 = Object.defineProperty;
var __defNormalProp22 = (obj, key, value) => key in obj ? __defProp22(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField22 = (obj, key, value) => {
  __defNormalProp22(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var checkEnabled = (logType) => {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      if (!this.enabled)
        return;
      if (logType < this.logLevel)
        return;
      originalMethod.apply(this, args);
    };
  };
};
var LogLevel;
(function(LogLevel22) {
  LogLevel22[LogLevel22["Info"] = 0] = "Info";
  LogLevel22[LogLevel22["Warn"] = 1] = "Warn";
  LogLevel22[LogLevel22["Error"] = 2] = "Error";
})(LogLevel || (LogLevel = {}));
var formatRegExp = /%[sdj%]/g;
var format = function(f) {
  if (!isString(f)) {
    const objects = [];
    for (let i2 = 0; i2 < arguments.length; i2++) {
      objects.push(inspect(arguments[i2]));
    }
    return objects.join(" ");
  }
  let i = 1;
  const args = arguments;
  const len = args.length;
  let str = String(f).replace(formatRegExp, function(x) {
    if (x === "%%")
      return "%";
    if (i >= len)
      return x;
    switch (x) {
      case "%s":
        return String(args[i++]);
      case "%d":
        return Number(args[i++]);
      case "%j":
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return "[Circular]";
        }
      default:
        return x;
    }
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += " " + x;
    } else {
      str += " " + inspect(x);
    }
  }
  return str;
};
function isArray(ar) {
  return Array.isArray(ar);
}
function isBoolean(arg) {
  return typeof arg === "boolean";
}
function isNull(arg) {
  return arg === null;
}
function isNumber(arg) {
  return typeof arg === "number";
}
function isString(arg) {
  return typeof arg === "string";
}
function isUndefined(arg) {
  return arg === void 0;
}
function isRegExp(re) {
  return isObject(re) && objectToString(re) === "[object RegExp]";
}
function isObject(arg) {
  return typeof arg === "object" && arg !== null;
}
function isDate(d) {
  return isObject(d) && objectToString(d) === "[object Date]";
}
function isError(e) {
  return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
}
function isFunction(arg) {
  return typeof arg === "function";
}
function inspect(obj, opts) {
  const ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  if (arguments.length >= 3)
    ctx.depth = arguments[2];
  if (arguments.length >= 4)
    ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    _extend(ctx, opts);
  }
  if (isUndefined(ctx.showHidden))
    ctx.showHidden = false;
  if (isUndefined(ctx.depth))
    ctx.depth = 2;
  if (isUndefined(ctx.colors))
    ctx.colors = false;
  if (isUndefined(ctx.customInspect))
    ctx.customInspect = true;
  if (ctx.colors)
    ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
function stylizeNoColor(str, styleType) {
  return str;
}
function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== inspect && !(value.constructor && value.constructor.prototype === value)) {
    let ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }
  const primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }
  let keys = Object.keys(value);
  const visibleKeys = arrayToHash(keys);
  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }
  if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
    return formatError(value);
  }
  if (keys.length === 0) {
    if (isFunction(value)) {
      const name = value.name ? ": " + value.name : "";
      return ctx.stylize("[Function" + name + "]", "special");
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), "date");
    }
    if (isError(value)) {
      return formatError(value);
    }
  }
  let base = "", array = false, braces = ["{", "}"];
  if (isArray(value)) {
    array = true;
    braces = ["[", "]"];
  }
  if (isFunction(value)) {
    const n = value.name ? ": " + value.name : "";
    base = " [Function" + n + "]";
  }
  if (isRegExp(value)) {
    base = " " + RegExp.prototype.toString.call(value);
  }
  if (isDate(value)) {
    base = " " + Date.prototype.toUTCString.call(value);
  }
  if (isError(value)) {
    base = " " + formatError(value);
  }
  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }
  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    } else {
      return ctx.stylize("[Object]", "special");
    }
  }
  ctx.seen.push(value);
  let output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }
  ctx.seen.pop();
  return reduceToSingleString(output, base, braces);
}
function reduceToSingleString(output, base, braces) {
  let numLinesEst = 0;
  const length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf("\n") >= 0)
      numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
  }, 0);
  if (length > 60) {
    return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
  }
  return braces[0] + base + " " + output.join(", ") + " " + braces[1];
}
function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize("undefined", "undefined");
  if (isString(value)) {
    const simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
    return ctx.stylize(simple, "string");
  }
  if (isNumber(value))
    return ctx.stylize("" + value, "number");
  if (isBoolean(value))
    return ctx.stylize("" + value, "boolean");
  if (isNull(value))
    return ctx.stylize("null", "null");
}
function formatError(value) {
  return "[" + Error.prototype.toString.call(value) + "]";
}
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  const output = [];
  for (let i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push("");
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  let name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize("[Getter/Setter]", "special");
    } else {
      str = ctx.stylize("[Getter]", "special");
    }
  } else {
    if (desc.set) {
      str = ctx.stylize("[Setter]", "special");
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = "[" + key + "]";
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf("\n") > -1) {
        if (array) {
          str = str.split("\n").map(function(line) {
            return "  " + line;
          }).join("\n").substr(2);
        } else {
          str = "\n" + str.split("\n").map(function(line) {
            return "   " + line;
          }).join("\n");
        }
      }
    } else {
      str = ctx.stylize("[Circular]", "special");
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify("" + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, "name");
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, "string");
    }
  }
  return name + ": " + str;
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function arrayToHash(array) {
  const hash = {};
  array.forEach(function(val, idx) {
    hash[val] = true;
  });
  return hash;
}
function _extend(origin, add) {
  if (!add || !isObject(add))
    return origin;
  const keys = Object.keys(add);
  let i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function objectToString(o) {
  return Object.prototype.toString.call(o);
}
function stylizeWithColor(str, styleType) {
  const style = inspect.styles[styleType];
  if (style) {
    return "\x1B[" + inspect.colors[style][0] + "m" + str + "\x1B[" + inspect.colors[style][1] + "m";
  } else {
    return str;
  }
}
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var _Logger = class {
  name;
  enabled = true;
  logLevel = LogLevel.Info;
  moreInfo;
  constructor(name, options) {
    this.name = name;
    if (options)
      this.applyOptions(options);
    this.log = this.log.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.moreInfo = alt.isServer ? this.moreInfoServer.bind(this) : this.moreInfoClient.bind(this);
  }
  static create(name, options) {
    return new _Logger(name, options);
  }
  applyOptions(options) {
    const { logLevel = this.logLevel, enabled = this.enabled } = options;
    this.logLevel = logLevel;
    this.enabled = enabled;
  }
  log(...args) {
    alt.log(`${_Logger.startLogColor}[${this.name}]~w~`, ...args);
  }
  warn(...args) {
    alt.logWarning(`[${this.name}]`, ...args);
  }
  error(...args) {
    if (args[0] instanceof Error) {
      args[0] = args[0].stack;
    }
    alt.logError(`[${this.name}]`, ...args);
  }
  moreInfoServer(...args) {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    console.log(`[${formatDateUnit(hour)}:${formatDateUnit(minute)}:${formatDateUnit(second)}]`, `${_Logger.nodeCyanColor}[${this.name}]${_Logger.nodeWhiteColor}`, ...args);
    function formatDateUnit(unit) {
      return unit >= 10 ? unit : `0${unit}`;
    }
  }
  moreInfoClient(...args) {
    alt.log(`${_Logger.startLogColor}[${this.name}]~w~`, ...args.map((a) => format(a)));
  }
};
var Logger = _Logger;
__publicField22(Logger, "startLogColor", "~cl~");
__publicField22(Logger, "nodeCyanColor", "\x1B[36m");
__publicField22(Logger, "nodeWhiteColor", "\x1B[37m");
__decorate([
  checkEnabled(LogLevel.Info),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", void 0)
], Logger.prototype, "log", null);
__decorate([
  checkEnabled(LogLevel.Warn),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", void 0)
], Logger.prototype, "warn", null);
__decorate([
  checkEnabled(LogLevel.Error),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", void 0)
], Logger.prototype, "error", null);
__decorate([
  checkEnabled(LogLevel.Info),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", void 0)
], Logger.prototype, "moreInfoServer", null);
__decorate([
  checkEnabled(LogLevel.Info),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", void 0)
], Logger.prototype, "moreInfoClient", null);
function create_default(name, options = {}) {
  const { enabled = true, logLevel = alt2.debug ? LogLevel.Info : LogLevel.Warn } = options;
  return Logger.create(name, { enabled, logLevel });
}
var MessageEventsManager = class {
  log = create_default("xsync:message-manager");
  eventsHandlers;
  constructor(events) {
    this.eventsHandlers = events;
  }
  send(eventName, args) {
    let message = `${eventName}|`;
    message += JSON.stringify(args);
    return message;
  }
  receive(rawMessage, extraFirstArgs = []) {
    try {
      const delimiter = rawMessage.indexOf("|");
      if (delimiter === -1) {
        throw new Error("invalid rawMessage (no delimiter)");
      }
      const eventName = rawMessage.slice(0, delimiter);
      const rawArgs = rawMessage.slice(delimiter + 1);
      const handler = this.eventsHandlers[eventName];
      if (!handler) {
        this.log.warn("[receive]", `event: ${eventName} no handlers`);
        return;
      }
      const args = JSON.parse(rawArgs);
      handler(...extraFirstArgs, ...args);
    } catch (e) {
      this.log.error("[receive]");
      this.log.error(e);
    }
  }
};
var ClientOnServerEvents;
(function(ClientOnServerEvents2) {
  ClientOnServerEvents2["AddPlayer"] = "xsyncEntity:addPlayer";
})(ClientOnServerEvents || (ClientOnServerEvents = {}));
var WSClientOnServerEvents;
(function(WSClientOnServerEvents2) {
  WSClientOnServerEvents2[WSClientOnServerEvents2["EntitiesStreamIn"] = 0] = "EntitiesStreamIn";
  WSClientOnServerEvents2[WSClientOnServerEvents2["EntitiesStreamOut"] = 1] = "EntitiesStreamOut";
  WSClientOnServerEvents2[WSClientOnServerEvents2["EntityDestroy"] = 2] = "EntityDestroy";
  WSClientOnServerEvents2[WSClientOnServerEvents2["EntitiesNetOwnerChange"] = 3] = "EntitiesNetOwnerChange";
  WSClientOnServerEvents2[WSClientOnServerEvents2["EntityPosChange"] = 4] = "EntityPosChange";
  WSClientOnServerEvents2[WSClientOnServerEvents2["EntitySyncedMetaChange"] = 5] = "EntitySyncedMetaChange";
})(WSClientOnServerEvents || (WSClientOnServerEvents = {}));
var WSServerOnClientEvents;
(function(WSServerOnClientEvents2) {
  WSServerOnClientEvents2[WSServerOnClientEvents2["UpdateEntitySyncedMeta"] = 0] = "UpdateEntitySyncedMeta";
  WSServerOnClientEvents2[WSServerOnClientEvents2["UpdateEntityPos"] = 1] = "UpdateEntityPos";
})(WSServerOnClientEvents || (WSServerOnClientEvents = {}));
var WSVectors = class {
  static altToWS({ x, y, z }) {
    return [
      +x.toFixed(3),
      +y.toFixed(3),
      +z.toFixed(3)
    ];
  }
  static WStoAlt([x, y, z]) {
    return { x, y, z };
  }
};
var checkEnabled2 = (logType) => {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      if (!this.enabled)
        return;
      if (logType < this.logLevel)
        return;
      originalMethod.apply(this, args);
    };
  };
};
var LogLevel2;
(function(LogLevel32) {
  LogLevel32[LogLevel32["Info"] = 0] = "Info";
  LogLevel32[LogLevel32["Warn"] = 1] = "Warn";
  LogLevel32[LogLevel32["Error"] = 2] = "Error";
})(LogLevel2 || (LogLevel2 = {}));
var formatRegExp2 = /%[sdj%]/g;
var format2 = function(f) {
  if (!isString2(f)) {
    const objects = [];
    for (let i2 = 0; i2 < arguments.length; i2++) {
      objects.push(inspect2(arguments[i2]));
    }
    return objects.join(" ");
  }
  let i = 1;
  const args = arguments;
  const len = args.length;
  let str = String(f).replace(formatRegExp2, function(x) {
    if (x === "%%")
      return "%";
    if (i >= len)
      return x;
    switch (x) {
      case "%s":
        return String(args[i++]);
      case "%d":
        return Number(args[i++]);
      case "%j":
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return "[Circular]";
        }
      default:
        return x;
    }
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    if (isNull2(x) || !isObject2(x)) {
      str += " " + x;
    } else {
      str += " " + inspect2(x);
    }
  }
  return str;
};
function isArray2(ar) {
  return Array.isArray(ar);
}
function isBoolean2(arg) {
  return typeof arg === "boolean";
}
function isNull2(arg) {
  return arg === null;
}
function isNumber2(arg) {
  return typeof arg === "number";
}
function isString2(arg) {
  return typeof arg === "string";
}
function isUndefined2(arg) {
  return arg === void 0;
}
function isRegExp2(re) {
  return isObject2(re) && objectToString2(re) === "[object RegExp]";
}
function isObject2(arg) {
  return typeof arg === "object" && arg !== null;
}
function isDate2(d) {
  return isObject2(d) && objectToString2(d) === "[object Date]";
}
function isError2(e) {
  return isObject2(e) && (objectToString2(e) === "[object Error]" || e instanceof Error);
}
function isFunction2(arg) {
  return typeof arg === "function";
}
function inspect2(obj, opts) {
  const ctx = {
    seen: [],
    stylize: stylizeNoColor2
  };
  if (arguments.length >= 3)
    ctx.depth = arguments[2];
  if (arguments.length >= 4)
    ctx.colors = arguments[3];
  if (isBoolean2(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    _extend2(ctx, opts);
  }
  if (isUndefined2(ctx.showHidden))
    ctx.showHidden = false;
  if (isUndefined2(ctx.depth))
    ctx.depth = 2;
  if (isUndefined2(ctx.colors))
    ctx.colors = false;
  if (isUndefined2(ctx.customInspect))
    ctx.customInspect = true;
  if (ctx.colors)
    ctx.stylize = stylizeWithColor2;
  return formatValue2(ctx, obj, ctx.depth);
}
function stylizeNoColor2(str, styleType) {
  return str;
}
function formatValue2(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction2(value.inspect) && value.inspect !== inspect2 && !(value.constructor && value.constructor.prototype === value)) {
    let ret = value.inspect(recurseTimes, ctx);
    if (!isString2(ret)) {
      ret = formatValue2(ctx, ret, recurseTimes);
    }
    return ret;
  }
  const primitive = formatPrimitive2(ctx, value);
  if (primitive) {
    return primitive;
  }
  let keys = Object.keys(value);
  const visibleKeys = arrayToHash2(keys);
  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }
  if (isError2(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
    return formatError2(value);
  }
  if (keys.length === 0) {
    if (isFunction2(value)) {
      const name = value.name ? ": " + value.name : "";
      return ctx.stylize("[Function" + name + "]", "special");
    }
    if (isRegExp2(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    }
    if (isDate2(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), "date");
    }
    if (isError2(value)) {
      return formatError2(value);
    }
  }
  let base = "", array = false, braces = ["{", "}"];
  if (isArray2(value)) {
    array = true;
    braces = ["[", "]"];
  }
  if (isFunction2(value)) {
    const n = value.name ? ": " + value.name : "";
    base = " [Function" + n + "]";
  }
  if (isRegExp2(value)) {
    base = " " + RegExp.prototype.toString.call(value);
  }
  if (isDate2(value)) {
    base = " " + Date.prototype.toUTCString.call(value);
  }
  if (isError2(value)) {
    base = " " + formatError2(value);
  }
  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }
  if (recurseTimes < 0) {
    if (isRegExp2(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    } else {
      return ctx.stylize("[Object]", "special");
    }
  }
  ctx.seen.push(value);
  let output;
  if (array) {
    output = formatArray2(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty2(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }
  ctx.seen.pop();
  return reduceToSingleString2(output, base, braces);
}
function reduceToSingleString2(output, base, braces) {
  let numLinesEst = 0;
  const length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf("\n") >= 0)
      numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
  }, 0);
  if (length > 60) {
    return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
  }
  return braces[0] + base + " " + output.join(", ") + " " + braces[1];
}
function formatPrimitive2(ctx, value) {
  if (isUndefined2(value))
    return ctx.stylize("undefined", "undefined");
  if (isString2(value)) {
    const simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
    return ctx.stylize(simple, "string");
  }
  if (isNumber2(value))
    return ctx.stylize("" + value, "number");
  if (isBoolean2(value))
    return ctx.stylize("" + value, "boolean");
  if (isNull2(value))
    return ctx.stylize("null", "null");
}
function formatError2(value) {
  return "[" + Error.prototype.toString.call(value) + "]";
}
function formatArray2(ctx, value, recurseTimes, visibleKeys, keys) {
  const output = [];
  for (let i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty2(value, String(i))) {
      output.push(formatProperty2(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push("");
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty2(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}
function formatProperty2(ctx, value, recurseTimes, visibleKeys, key, array) {
  let name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize("[Getter/Setter]", "special");
    } else {
      str = ctx.stylize("[Getter]", "special");
    }
  } else {
    if (desc.set) {
      str = ctx.stylize("[Setter]", "special");
    }
  }
  if (!hasOwnProperty2(visibleKeys, key)) {
    name = "[" + key + "]";
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull2(recurseTimes)) {
        str = formatValue2(ctx, desc.value, null);
      } else {
        str = formatValue2(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf("\n") > -1) {
        if (array) {
          str = str.split("\n").map(function(line) {
            return "  " + line;
          }).join("\n").substr(2);
        } else {
          str = "\n" + str.split("\n").map(function(line) {
            return "   " + line;
          }).join("\n");
        }
      }
    } else {
      str = ctx.stylize("[Circular]", "special");
    }
  }
  if (isUndefined2(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify("" + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, "name");
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, "string");
    }
  }
  return name + ": " + str;
}
function hasOwnProperty2(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function arrayToHash2(array) {
  const hash = {};
  array.forEach(function(val, idx) {
    hash[val] = true;
  });
  return hash;
}
function _extend2(origin, add) {
  if (!add || !isObject2(add))
    return origin;
  const keys = Object.keys(add);
  let i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function objectToString2(o) {
  return Object.prototype.toString.call(o);
}
function stylizeWithColor2(str, styleType) {
  const style = inspect2.styles[styleType];
  if (style) {
    return "\x1B[" + inspect2.colors[style][0] + "m" + str + "\x1B[" + inspect2.colors[style][1] + "m";
  } else {
    return str;
  }
}
var __decorate2 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata2 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var _Logger2 = class {
  name;
  enabled = true;
  logLevel = LogLevel2.Info;
  moreInfo;
  constructor(name, options) {
    this.name = name;
    if (options)
      this.applyOptions(options);
    this.log = this.log.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.moreInfo = alt3.isServer ? this.moreInfoServer.bind(this) : this.moreInfoClient.bind(this);
  }
  static create(name, options) {
    return new _Logger2(name, options);
  }
  applyOptions(options) {
    const { logLevel = this.logLevel, enabled = this.enabled } = options;
    this.logLevel = logLevel;
    this.enabled = enabled;
  }
  log(...args) {
    alt3.log(`${_Logger2.startLogColor}[${this.name}]~w~`, ...args);
  }
  warn(...args) {
    alt3.logWarning(`[${this.name}]`, ...args);
  }
  error(...args) {
    if (args[0] instanceof Error) {
      args[0] = args[0].stack;
    }
    alt3.logError(`[${this.name}]`, ...args);
  }
  moreInfoServer(...args) {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    console.log(`[${formatDateUnit(hour)}:${formatDateUnit(minute)}:${formatDateUnit(second)}]`, `${_Logger2.nodeCyanColor}[${this.name}]${_Logger2.nodeWhiteColor}`, ...args);
    function formatDateUnit(unit) {
      return unit >= 10 ? unit : `0${unit}`;
    }
  }
  moreInfoClient(...args) {
    alt3.log(`${_Logger2.startLogColor}[${this.name}]~w~`, ...args.map((a) => format2(a)));
  }
};
var Logger2 = _Logger2;
__publicField2(Logger2, "startLogColor", "~cl~");
__publicField2(Logger2, "nodeCyanColor", "\x1B[36m");
__publicField2(Logger2, "nodeWhiteColor", "\x1B[37m");
__decorate2([
  checkEnabled2(LogLevel2.Info),
  __metadata2("design:type", Function),
  __metadata2("design:paramtypes", [Object]),
  __metadata2("design:returntype", void 0)
], Logger2.prototype, "log", null);
__decorate2([
  checkEnabled2(LogLevel2.Warn),
  __metadata2("design:type", Function),
  __metadata2("design:paramtypes", [Object]),
  __metadata2("design:returntype", void 0)
], Logger2.prototype, "warn", null);
__decorate2([
  checkEnabled2(LogLevel2.Error),
  __metadata2("design:type", Function),
  __metadata2("design:paramtypes", [Object]),
  __metadata2("design:returntype", void 0)
], Logger2.prototype, "error", null);
__decorate2([
  checkEnabled2(LogLevel2.Info),
  __metadata2("design:type", Function),
  __metadata2("design:paramtypes", [Object]),
  __metadata2("design:returntype", void 0)
], Logger2.prototype, "moreInfoServer", null);
__decorate2([
  checkEnabled2(LogLevel2.Info),
  __metadata2("design:type", Function),
  __metadata2("design:paramtypes", [Object]),
  __metadata2("design:returntype", void 0)
], Logger2.prototype, "moreInfoClient", null);
function create_default2(name, options = {}) {
  const { enabled = true, logLevel = alt4.debug ? LogLevel2.Info : LogLevel2.Warn } = options;
  return Logger2.create(name, { enabled, logLevel });
}
var WSClient = class {
  log = create_default2("xsync:ws", {
    logLevel: true ? LogLevel2.Info : LogLevel2.Warn
  });
  player = Player.local;
  messageHandlers = /* @__PURE__ */ new Set();
  eventsManager;
  waitConnectPromise;
  client;
  socketCloseHandler;
  connected = false;
  constructor(url, authCode, options) {
    this.log.log(`connect url: ${url}`);
    this.client = this.initClient(authCode, url);
    this.waitConnectPromise = this.initWaitConnectPromise();
    this.eventsManager = this.initUserEvents(options);
    this.socketCloseHandler = options.close;
    this.setupWsClientEvents(this.client);
  }
  send(eventName, ...args) {
    const message = this.eventsManager.send(eventName, args);
    return this.client.send(message);
  }
  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
  }
  waitConnect() {
    return this.waitConnectPromise.promise;
  }
  initClient(authCode, url) {
    const client = new WebSocketClient(url);
    client.setExtraHeader("authcode", authCode);
    client.setExtraHeader("playerid", this.player.id.toString());
    client.pingInterval = 15;
    client.autoReconnect = false;
    client.perMessageDeflate = true;
    client.start();
    this.log.log("started connecting...", new Date().getMilliseconds());
    return client;
  }
  setupWsClientEvents(client) {
    client.on("open", this.onOpen.bind(this));
    client.on("close", this.onClose.bind(this));
    client.on("error", this.onError.bind(this));
    client.on("message", this.onMessage.bind(this));
  }
  onOpen() {
    this.connected = true;
    this.waitConnectPromise.resolve();
    this.log.log("~gl~successful connection~w~ to the server", new Date().getMilliseconds());
  }
  onClose(code, reason) {
    this.waitConnectPromise.reject(new Error(reason));
    this.log.error("[close]", "code:", code, "reason:", reason);
    this.socketCloseHandler();
  }
  onMessage(message) {
    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }
  onError(error) {
    if (!this.connected) {
      this.waitConnectPromise.reject(new Error(error));
    }
    this.log.error("[error]", error);
  }
  initUserEvents({ events }) {
    const manager = new MessageEventsManager(events);
    this.addMessageHandler((raw) => {
      manager.receive(raw);
    });
    return manager;
  }
  initWaitConnectPromise() {
    return {
      promise: new Promise((resolve, reject) => {
        nextTick(() => {
          this.waitConnectPromise.resolve = resolve;
          this.waitConnectPromise.reject = (_error) => {
            const error = new Error(`[connection reject] ${_error.message}`);
            error.stack = _error.stack;
            reject(error);
          };
        });
      })
    };
  }
};
var log = create_default2("xsync", { logLevel: true ? LogLevel2.Info : LogLevel2.Warn });
var _InternalEntity = class {
  constructor(publicInstance, id, pos, syncedMeta) {
    this.publicInstance = publicInstance;
    this.id = id;
    this.pos = pos;
    this.syncedMeta = syncedMeta;
    if (!_InternalEntity.reservedEntities[id]) {
      throw new Error("Entity cannot be created by client");
    }
    delete _InternalEntity.reservedEntities[id];
    _InternalEntity.publicInternals.set(publicInstance, this);
  }
  static getInternalByPublic(publicEntity) {
    const internal = this.publicInternals.get(publicEntity);
    if (!internal) {
      throw new Error(`InternalEntity: getInternalByPublic unknown publicEntity: ${publicEntity?.id}`);
    }
    return internal;
  }
  static addEventHandlers(entityClass, handlers) {
    this.handlers.set(entityClass, handlers);
  }
  static handleEvent(entity, eventName, ...args) {
    const entityClass = entity.publicInstance.constructor;
    const logMessage = `received remote event "${eventName}" for entity class: ${entityClass.name} |`;
    const handlers = this.handlers.get(entityClass);
    if (!handlers) {
      throw new Error(`[xsync] ${logMessage} no event handlers are set, use the @onEvents() decorator on your entity class`);
    }
    const handler = handlers[eventName];
    if (!handler) {
      log.warn(`${logMessage} no handler is set, which can be set in the @onEvents() decorator`);
      return;
    }
    handler(entity.publicInstance, ...args);
  }
  netOwnered = false;
  streamed = true;
  streamIn() {
    _InternalEntity.handleEvent(this, "streamIn");
  }
  streamOut() {
    this.streamed = false;
    this.netOwnered = false;
    _InternalEntity.handleEvent(this, "streamOut");
  }
  posChange(pos) {
    this.pos = pos;
    _InternalEntity.handleEvent(this, "posChange", pos);
  }
  syncedMetaChange(syncedMeta) {
    Object.assign(this.syncedMeta, syncedMeta);
    _InternalEntity.handleEvent(this, "syncedMetaChange", syncedMeta);
  }
  netOwnerChange(isLocalPlayerNetOwner, syncedMeta) {
    this.netOwnered = isLocalPlayerNetOwner;
    _InternalEntity.handleEvent(this, "netOwnerChange", isLocalPlayerNetOwner, syncedMeta);
  }
};
var InternalEntity = _InternalEntity;
__publicField2(InternalEntity, "publicInternals", /* @__PURE__ */ new Map());
__publicField2(InternalEntity, "handlers", /* @__PURE__ */ new Map());
__publicField2(InternalEntity, "reservedEntities", {});
var _InternalEntityPool = class {
  constructor(id, EntityClass) {
    this.id = id;
    this.EntityClass = EntityClass;
    this.log = create_default2(`xsync:entitypool ${EntityClass.name} (id: ${this.id})`);
    InternalXSyncEntity.instance.addEntityPool(this);
  }
  static streamOutEntity(entityOrId) {
    let entity;
    if (typeof entityOrId === "number") {
      entity = this.entities[entityOrId];
    } else {
      entity = entityOrId;
    }
    if (!entity) {
      this.log.error(`[streamOutEntity] unknown entity id: ${entityOrId}`);
      return;
    }
    entity.streamOut();
    delete this.entities[entity.id];
  }
  log;
  streamInEntity(entity) {
    const internal = InternalEntity.getInternalByPublic(entity);
    _InternalEntityPool.entities[entity.id] = internal;
    internal.streamIn();
  }
};
var InternalEntityPool = _InternalEntityPool;
__publicField2(InternalEntityPool, "entities", {});
__publicField2(InternalEntityPool, "log", create_default2("xsync:internal-entitypool"));
var getServerIp2 = () => {
  const rawIp = getServerIp();
  return rawIp.slice(7);
};
var _InternalXSyncEntity = class {
  static get instance() {
    const { _instance } = this;
    if (!_instance) {
      throw new Error("InternalXSyncEntity has not been initialized yet");
    }
    return _instance;
  }
  log = create_default2("xsync", {
    logLevel: true ? LogLevel2.Info : LogLevel2.Warn
  });
  entityPools = {};
  netOwnerChangeHandler;
  netOwneredEntityIds = /* @__PURE__ */ new Set();
  WSEventHandlers = {
    [WSClientOnServerEvents.EntitiesStreamIn]: (entities) => {
      this.log.log(`stream in: ${entities.length}`);
      for (let i = 0; i < entities.length; i++) {
        const [poolId, entityId, pos, syncedMeta] = entities[i];
        const entityPool = this.entityPools[poolId];
        if (!entityPool) {
          throw new Error(`[WSClientOnServerEvents.EntitiesStreamIn] unknown pool id: ${poolId}`);
        }
        const posVector3 = WSVectors.WStoAlt(pos);
        InternalEntity.reservedEntities[entityId] = true;
        const entity = new entityPool.EntityClass(entityId, posVector3, syncedMeta);
        entityPool.streamInEntity(entity);
      }
    },
    [WSClientOnServerEvents.EntitiesStreamOut]: (entityIds) => {
      this.log.log(`stream out: ${entityIds.length}`);
      for (let i = 0; i < entityIds.length; i++) {
        const entity = InternalEntityPool.entities[entityIds[i]];
        if (!entity)
          continue;
        this.removeNetOwneredEntity(entity);
        InternalEntityPool.streamOutEntity(entityIds[i]);
      }
    },
    [WSClientOnServerEvents.EntityDestroy]: (entityId) => {
      const entity = InternalEntityPool.entities[entityId];
      if (!entity)
        return;
      this.removeNetOwneredEntity(entity);
      InternalEntityPool.streamOutEntity(entityId);
    },
    [WSClientOnServerEvents.EntitiesNetOwnerChange]: (entities) => {
      for (let i = 0; i < entities.length; i++) {
        const [entityId, isLocalPlayerNetOwner, syncedMeta] = entities[i];
        const entity = InternalEntityPool.entities[entityId];
        if (!entity)
          continue;
        const netOwnered = !!isLocalPlayerNetOwner;
        syncedMeta && entity.syncedMetaChange(syncedMeta);
        entity.netOwnerChange(netOwnered, syncedMeta);
        this.netOwnerChangeHandler?.(entity.publicInstance, netOwnered);
        if (netOwnered) {
          this.netOwneredEntityIds.add(entityId);
        } else
          this.removeNetOwneredEntity(entity);
      }
    },
    [WSClientOnServerEvents.EntityPosChange]: (entityId, pos) => {
      const entity = InternalEntityPool.entities[entityId];
      if (!entity)
        return;
      entity.posChange(WSVectors.WStoAlt(pos));
    },
    [WSClientOnServerEvents.EntitySyncedMetaChange]: (entityId, syncedMeta) => {
      const entity = InternalEntityPool.entities[entityId];
      if (!entity)
        return;
      entity.syncedMetaChange(syncedMeta);
    }
  };
  ws = null;
  constructor(netOwnerLogic) {
    if (_InternalXSyncEntity._instance) {
      throw new Error("InternalXSyncEntity already initialized");
    }
    _InternalXSyncEntity._instance = this;
    this.netOwnerChangeHandler = netOwnerLogic?.entityNetOwnerChange;
    this.setupAltvEvents();
  }
  addEntityPool(pool) {
    if (this.entityPools[pool.id]) {
      throw new Error(`[addEntityPool] already exist pool id: ${pool.id}`);
    }
    this.entityPools[pool.id] = pool;
  }
  updateNetOwnerSyncedMeta(entity, meta) {
    this.emitWSServer(WSServerOnClientEvents.UpdateEntitySyncedMeta, entity.id, meta);
  }
  updateNetOwnerPos(entity, pos) {
    this.emitWSServer(WSServerOnClientEvents.UpdateEntityPos, entity.id, WSVectors.altToWS(pos));
  }
  setupAltvEvents() {
    onServer(ClientOnServerEvents.AddPlayer, this.onAddPlayer.bind(this));
  }
  emitWSServer(eventName, ...args) {
    this.ws?.send(eventName.toString(), ...args);
  }
  onAddPlayer(authCode, serverUrl) {
    let fullServerUrl;
    if (serverUrl.startsWith("localhost")) {
      const port = serverUrl.slice(serverUrl.indexOf(":") + 1);
      fullServerUrl = `ws://${getServerIp2()}:${port}`;
    } else {
      fullServerUrl = `${serverUrl}`;
    }
    this.log.log("onAddPlayer", authCode, serverUrl, fullServerUrl);
    const ws = new WSClient(fullServerUrl, authCode, {
      events: this.WSEventHandlers,
      close: this.onWSClose.bind(this)
    });
    this.ws = ws;
  }
  onWSClose() {
    this.log.log("on ws close destroy entities");
    for (const entityId in InternalEntityPool.entities) {
      try {
        InternalEntityPool.entities[entityId]?.streamOut();
      } catch (e) {
        this.log.error(e);
      }
    }
  }
  removeNetOwneredEntity(entity) {
    this.netOwneredEntityIds.delete(entity.id);
  }
};
var InternalXSyncEntity = _InternalXSyncEntity;
__publicField2(InternalXSyncEntity, "_instance", null);
var XSyncEntity = class {
  internal;
  constructor(netOwnerLogic) {
    this.internal = new InternalXSyncEntity(netOwnerLogic);
  }
};
var Entity = class {
  constructor(id, pos, syncedMeta) {
    this.id = id;
    this.internalInstance = new InternalEntity(this, id, pos, syncedMeta);
  }
  internalInstance;
  static getByID(id) {
    const entity = InternalEntityPool.entities[id]?.publicInstance;
    return entity instanceof this ? entity : null;
  }
  get pos() {
    return this.internalInstance.pos;
  }
  get netOwnered() {
    return this.internalInstance.netOwnered;
  }
  get syncedMeta() {
    return this.internalInstance.syncedMeta;
  }
  get streamed() {
    return this.internalInstance.streamed;
  }
};
var onEntityEvents = (events) => (entityClass) => {
  InternalEntity.addEventHandlers(entityClass, events);
};
var EntityPool = class {
  constructor(id, EntityClass) {
    this.id = id;
    this.EntityClass = EntityClass;
    this.internal = new InternalEntityPool(id, EntityClass);
  }
  internal;
  updateNetOwnerSyncedMeta(entity, syncedMeta) {
    if (!entity.netOwnered)
      return;
    InternalXSyncEntity.instance.updateNetOwnerSyncedMeta(entity, syncedMeta);
  }
  updateNetOwnerPos(entity, pos) {
    if (!entity.netOwnered)
      return;
    InternalXSyncEntity.instance.updateNetOwnerPos(entity, pos);
  }
};

// ../shared/dist/main.js
import alt22 from "alt-shared";
import alt5 from "alt-shared";
var __defProp3 = Object.defineProperty;
var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField3 = (obj, key, value) => {
  __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var checkEnabled3 = (logType) => {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      if (!this.enabled)
        return;
      if (logType < this.logLevel)
        return;
      originalMethod.apply(this, args);
    };
  };
};
var LogLevel3;
(function(LogLevel22) {
  LogLevel22[LogLevel22["Info"] = 0] = "Info";
  LogLevel22[LogLevel22["Warn"] = 1] = "Warn";
  LogLevel22[LogLevel22["Error"] = 2] = "Error";
})(LogLevel3 || (LogLevel3 = {}));
var formatRegExp3 = /%[sdj%]/g;
var format3 = function(f) {
  if (!isString3(f)) {
    const objects = [];
    for (let i2 = 0; i2 < arguments.length; i2++) {
      objects.push(inspect3(arguments[i2]));
    }
    return objects.join(" ");
  }
  let i = 1;
  const args = arguments;
  const len = args.length;
  let str = String(f).replace(formatRegExp3, function(x) {
    if (x === "%%")
      return "%";
    if (i >= len)
      return x;
    switch (x) {
      case "%s":
        return String(args[i++]);
      case "%d":
        return Number(args[i++]);
      case "%j":
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return "[Circular]";
        }
      default:
        return x;
    }
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    if (isNull3(x) || !isObject3(x)) {
      str += " " + x;
    } else {
      str += " " + inspect3(x);
    }
  }
  return str;
};
function isArray3(ar) {
  return Array.isArray(ar);
}
function isBoolean3(arg) {
  return typeof arg === "boolean";
}
function isNull3(arg) {
  return arg === null;
}
function isNumber3(arg) {
  return typeof arg === "number";
}
function isString3(arg) {
  return typeof arg === "string";
}
function isUndefined3(arg) {
  return arg === void 0;
}
function isRegExp3(re) {
  return isObject3(re) && objectToString3(re) === "[object RegExp]";
}
function isObject3(arg) {
  return typeof arg === "object" && arg !== null;
}
function isDate3(d) {
  return isObject3(d) && objectToString3(d) === "[object Date]";
}
function isError3(e) {
  return isObject3(e) && (objectToString3(e) === "[object Error]" || e instanceof Error);
}
function isFunction3(arg) {
  return typeof arg === "function";
}
function inspect3(obj, opts) {
  const ctx = {
    seen: [],
    stylize: stylizeNoColor3
  };
  if (arguments.length >= 3)
    ctx.depth = arguments[2];
  if (arguments.length >= 4)
    ctx.colors = arguments[3];
  if (isBoolean3(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    _extend3(ctx, opts);
  }
  if (isUndefined3(ctx.showHidden))
    ctx.showHidden = false;
  if (isUndefined3(ctx.depth))
    ctx.depth = 2;
  if (isUndefined3(ctx.colors))
    ctx.colors = false;
  if (isUndefined3(ctx.customInspect))
    ctx.customInspect = true;
  if (ctx.colors)
    ctx.stylize = stylizeWithColor3;
  return formatValue3(ctx, obj, ctx.depth);
}
function stylizeNoColor3(str, styleType) {
  return str;
}
function formatValue3(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction3(value.inspect) && value.inspect !== inspect3 && !(value.constructor && value.constructor.prototype === value)) {
    let ret = value.inspect(recurseTimes, ctx);
    if (!isString3(ret)) {
      ret = formatValue3(ctx, ret, recurseTimes);
    }
    return ret;
  }
  const primitive = formatPrimitive3(ctx, value);
  if (primitive) {
    return primitive;
  }
  let keys = Object.keys(value);
  const visibleKeys = arrayToHash3(keys);
  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }
  if (isError3(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
    return formatError3(value);
  }
  if (keys.length === 0) {
    if (isFunction3(value)) {
      const name = value.name ? ": " + value.name : "";
      return ctx.stylize("[Function" + name + "]", "special");
    }
    if (isRegExp3(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    }
    if (isDate3(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), "date");
    }
    if (isError3(value)) {
      return formatError3(value);
    }
  }
  let base = "", array = false, braces = ["{", "}"];
  if (isArray3(value)) {
    array = true;
    braces = ["[", "]"];
  }
  if (isFunction3(value)) {
    const n = value.name ? ": " + value.name : "";
    base = " [Function" + n + "]";
  }
  if (isRegExp3(value)) {
    base = " " + RegExp.prototype.toString.call(value);
  }
  if (isDate3(value)) {
    base = " " + Date.prototype.toUTCString.call(value);
  }
  if (isError3(value)) {
    base = " " + formatError3(value);
  }
  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }
  if (recurseTimes < 0) {
    if (isRegExp3(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    } else {
      return ctx.stylize("[Object]", "special");
    }
  }
  ctx.seen.push(value);
  let output;
  if (array) {
    output = formatArray3(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty3(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }
  ctx.seen.pop();
  return reduceToSingleString3(output, base, braces);
}
function reduceToSingleString3(output, base, braces) {
  let numLinesEst = 0;
  const length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf("\n") >= 0)
      numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
  }, 0);
  if (length > 60) {
    return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
  }
  return braces[0] + base + " " + output.join(", ") + " " + braces[1];
}
function formatPrimitive3(ctx, value) {
  if (isUndefined3(value))
    return ctx.stylize("undefined", "undefined");
  if (isString3(value)) {
    const simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
    return ctx.stylize(simple, "string");
  }
  if (isNumber3(value))
    return ctx.stylize("" + value, "number");
  if (isBoolean3(value))
    return ctx.stylize("" + value, "boolean");
  if (isNull3(value))
    return ctx.stylize("null", "null");
}
function formatError3(value) {
  return "[" + Error.prototype.toString.call(value) + "]";
}
function formatArray3(ctx, value, recurseTimes, visibleKeys, keys) {
  const output = [];
  for (let i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty3(value, String(i))) {
      output.push(formatProperty3(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push("");
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty3(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}
function formatProperty3(ctx, value, recurseTimes, visibleKeys, key, array) {
  let name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize("[Getter/Setter]", "special");
    } else {
      str = ctx.stylize("[Getter]", "special");
    }
  } else {
    if (desc.set) {
      str = ctx.stylize("[Setter]", "special");
    }
  }
  if (!hasOwnProperty3(visibleKeys, key)) {
    name = "[" + key + "]";
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull3(recurseTimes)) {
        str = formatValue3(ctx, desc.value, null);
      } else {
        str = formatValue3(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf("\n") > -1) {
        if (array) {
          str = str.split("\n").map(function(line) {
            return "  " + line;
          }).join("\n").substr(2);
        } else {
          str = "\n" + str.split("\n").map(function(line) {
            return "   " + line;
          }).join("\n");
        }
      }
    } else {
      str = ctx.stylize("[Circular]", "special");
    }
  }
  if (isUndefined3(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify("" + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, "name");
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, "string");
    }
  }
  return name + ": " + str;
}
function hasOwnProperty3(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function arrayToHash3(array) {
  const hash = {};
  array.forEach(function(val, idx) {
    hash[val] = true;
  });
  return hash;
}
function _extend3(origin, add) {
  if (!add || !isObject3(add))
    return origin;
  const keys = Object.keys(add);
  let i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function objectToString3(o) {
  return Object.prototype.toString.call(o);
}
function stylizeWithColor3(str, styleType) {
  const style = inspect3.styles[styleType];
  if (style) {
    return "\x1B[" + inspect3.colors[style][0] + "m" + str + "\x1B[" + inspect3.colors[style][1] + "m";
  } else {
    return str;
  }
}
var __decorate3 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata3 = function(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(k, v);
};
var _Logger3 = class {
  name;
  enabled = true;
  logLevel = LogLevel3.Info;
  moreInfo;
  constructor(name, options) {
    this.name = name;
    if (options)
      this.applyOptions(options);
    this.log = this.log.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.moreInfo = alt5.isServer ? this.moreInfoServer.bind(this) : this.moreInfoClient.bind(this);
  }
  applyOptions(options) {
    const { logLevel = this.logLevel, enabled = this.enabled } = options;
    this.logLevel = logLevel;
    this.enabled = enabled;
  }
  log(...args) {
    alt5.log(`${_Logger3.startLogColor}[${this.name}]~w~`, ...args);
  }
  warn(...args) {
    alt5.logWarning(`[${this.name}]`, ...args);
  }
  error(...args) {
    if (args[0] instanceof Error) {
      args[0] = args[0].stack;
    }
    alt5.logError(`[${this.name}]`, ...args);
  }
  moreInfoServer(...args) {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    console.log(`[${formatDateUnit(hour)}:${formatDateUnit(minute)}:${formatDateUnit(second)}]`, `${_Logger3.nodeCyanColor}[${this.name}]${_Logger3.nodeWhiteColor}`, ...args);
    function formatDateUnit(unit) {
      return unit >= 10 ? unit : `0${unit}`;
    }
  }
  moreInfoClient(...args) {
    alt5.log(`${_Logger3.startLogColor}[${this.name}]~w~`, ...args.map((a) => format3(a)));
  }
};
var Logger3 = _Logger3;
__publicField3(Logger3, "startLogColor", "~cl~");
__publicField3(Logger3, "nodeCyanColor", "\x1B[36m");
__publicField3(Logger3, "nodeWhiteColor", "\x1B[37m");
__decorate3([
  checkEnabled3(LogLevel3.Info),
  __metadata3("design:type", Function),
  __metadata3("design:paramtypes", [Object]),
  __metadata3("design:returntype", void 0)
], Logger3.prototype, "log", null);
__decorate3([
  checkEnabled3(LogLevel3.Warn),
  __metadata3("design:type", Function),
  __metadata3("design:paramtypes", [Object]),
  __metadata3("design:returntype", void 0)
], Logger3.prototype, "warn", null);
__decorate3([
  checkEnabled3(LogLevel3.Error),
  __metadata3("design:type", Function),
  __metadata3("design:paramtypes", [Object]),
  __metadata3("design:returntype", void 0)
], Logger3.prototype, "error", null);
__decorate3([
  checkEnabled3(LogLevel3.Info),
  __metadata3("design:type", Function),
  __metadata3("design:paramtypes", [Object]),
  __metadata3("design:returntype", void 0)
], Logger3.prototype, "moreInfoServer", null);
__decorate3([
  checkEnabled3(LogLevel3.Info),
  __metadata3("design:type", Function),
  __metadata3("design:paramtypes", [Object]),
  __metadata3("design:returntype", void 0)
], Logger3.prototype, "moreInfoClient", null);
var Logger22 = class extends Logger3 {
  constructor(name) {
    super(`xpeds-sync > ${name}`);
  }
};
var AltClientEvents = /* @__PURE__ */ ((AltClientEvents2) => {
  AltClientEvents2["Init"] = "xpedsSync:init";
  return AltClientEvents2;
})(AltClientEvents || {});

// src/ped/internal/class.ts
import * as alt10 from "alt-client";

// src/ped/class.ts
import * as alt6 from "alt-client";
var Ped = class {
  constructor(id, internalInstance) {
    this.id = id;
    this.internalInstance = internalInstance;
  }
  static get streamedIn() {
    return [...InternalPed.streamedIn].map((p) => p.publicInstance);
  }
  get scriptID() {
    return this.internalInstance.gamePed.scriptID;
  }
  get pos() {
    return new alt6.Vector3(this.internalInstance.gamePed.pos);
  }
  netOwnered() {
    return this.internalInstance.xsyncPed.netOwnered;
  }
};

// src/ped/game/class.ts
import * as alt7 from "alt-client";
import * as native from "natives";
var log2 = new Logger22("game-ped");
var _GamePed = class {
  static {
    alt7.on("resourceStop", () => _GamePed.peds.forEach((p) => p.destroy()));
  }
  _scriptID = 0;
  options;
  spawnListener;
  constructor(xsyncPed, options) {
    const {
      model
    } = options;
    this.options = options;
    let resolve = () => {
    };
    let reject = () => {
    };
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    this.spawnListener = {
      promise,
      resolve,
      reject
    };
    alt7.Utils.requestModel(model, 3e3).then(() => {
      if (!xsyncPed.streamed) {
        this.spawnListener?.reject();
        return;
      }
      this.spawnListener?.resolve();
      this.createPed();
      _GamePed.peds.add(this);
    }).catch((e) => {
      this.spawnListener?.reject();
      log2.error("failed to load model:", model, "of ped id:", xsyncPed.id);
      log2.error(e);
    });
  }
  get scriptID() {
    return this._scriptID;
  }
  get pos() {
    return native.getEntityCoords(this._scriptID, false);
  }
  set pos({ x, y, z }) {
    native.setEntityCoords(this._scriptID, x, y, z, false, false, false, false);
  }
  get health() {
    return native.getEntityHealth(this._scriptID);
  }
  set health(value) {
    native.setEntityHealth(this._scriptID, value, 0);
  }
  get ragdoll() {
    return native.isPedRagdoll(this._scriptID);
  }
  set ragdoll(value) {
    if (value) {
      native.setPedToRagdoll(this._scriptID, 1, 1, 0, false, false, false);
    }
  }
  get isWalking() {
    return native.isPedWalking(this._scriptID) || native.isPedRunning(this._scriptID);
  }
  get heading() {
    return native.getEntityHeading(this._scriptID);
  }
  async waitForSpawn() {
    if (this._scriptID)
      return;
    await this.spawnListener?.promise;
    this.spawnListener = null;
  }
  destroy() {
    if (!this._scriptID)
      return;
    this.destroyInGame();
    _GamePed.peds.delete(this);
    this._scriptID = 0;
  }
  setVelocity({ x, y, z }) {
    native.setEntityVelocity(this._scriptID, x, y, z);
  }
  gotoCoord({ x, y, z }, speed, heading) {
    native.taskGoStraightToCoord(this._scriptID, x, y, z, speed, -1, heading, 0);
  }
  resurrect(health) {
    if (!this._scriptID)
      return;
    this.destroyInGame();
    this.createPed({
      model: this.options.model,
      health,
      pos: this.pos
    });
  }
  createPed({
    model,
    pos,
    health
  } = this.options) {
    const ped = native.createPed(2, model, pos.x, pos.y, pos.z - 1, 0, false, false);
    alt7.nextTick(() => {
      this.health = health;
    });
    native.setBlockingOfNonTemporaryEvents(ped, true);
    native.setPedConfigFlag(ped, 281, true);
    this._scriptID = ped;
  }
  destroyInGame() {
    native.deletePed(this._scriptID);
  }
};
var GamePed = _GamePed;
__publicField(GamePed, "peds", /* @__PURE__ */ new Set());

// src/ped/net-owner/class.ts
import * as alt8 from "alt-client";
var _NetOwnerPed = class {
  constructor(internalPed) {
    this.internalPed = internalPed;
  }
  posInterval = alt8.setInterval(this.posIntervalHandler.bind(this), _NetOwnerPed.POS_INTERVAL_MS);
  metaInterval = alt8.setInterval(this.metaIntervalHandler.bind(this), _NetOwnerPed.META_INTERVAL_MS);
  prevHealth = 0;
  prevHeading = 0;
  prevRagdoll = false;
  prevIsWalking = false;
  destroy() {
    alt8.clearInterval(this.metaInterval);
    alt8.clearInterval(this.posInterval);
  }
  posIntervalHandler() {
    this.internalPed.sendNetOwnerPosUpdate(this.internalPed.gamePed.pos);
  }
  metaIntervalHandler() {
    if (!this.internalPed.gamePed.scriptID)
      return;
    const updatedMeta = {};
    let {
      heading
    } = this.internalPed.gamePed;
    const {
      health,
      ragdoll,
      isWalking
    } = this.internalPed.gamePed;
    if (this.prevHealth !== health) {
      updatedMeta.health = health;
      this.prevHealth = health;
    }
    if (health > 0) {
      heading = +heading.toFixed(1);
      if (this.prevHeading !== heading) {
        updatedMeta.heading = heading;
        this.prevHeading = heading;
      }
      if (this.prevRagdoll !== ragdoll) {
        updatedMeta.ragdoll = +ragdoll;
        this.prevRagdoll = ragdoll;
      }
      if (this.prevIsWalking !== isWalking) {
        updatedMeta.isWalking = +isWalking;
        this.prevIsWalking = isWalking;
      }
    }
    if (Object.keys(updatedMeta).length > 0)
      this.internalPed.sendNetOwnerSyncedMetaUpdate(updatedMeta);
  }
};
var NetOwnerPed = _NetOwnerPed;
__publicField(NetOwnerPed, "POS_INTERVAL_MS", 80);
__publicField(NetOwnerPed, "META_INTERVAL_MS", 100);

// src/ped/observer/class.ts
import * as alt9 from "alt-client";
var ObserverPed = class {
  constructor(internalPed) {
    this.internalPed = internalPed;
    this.log = new Logger22(`observer: ${internalPed.xsyncPed.id}`);
  }
  log;
  prevRagdoll = false;
  startRagdollTime = 0;
  posTick = alt9.everyTick(this.posTickHandler.bind(this));
  metaTick = alt9.everyTick(this.metaTickHandler.bind(this));
  destroy() {
    alt9.clearEveryTick(this.posTick);
    alt9.clearEveryTick(this.metaTick);
  }
  posTickHandler() {
    const {
      gamePed,
      xsyncPed: {
        pos: targetPos,
        syncedMeta
      }
    } = this.internalPed;
    const dist = gamePed.pos.distanceTo(targetPos);
    if (dist > 5) {
      gamePed.pos = targetPos;
      return;
    }
    if (!syncedMeta.health)
      return;
    if (!syncedMeta.ragdoll)
      return;
    const multiplier = syncedMeta.isWalking ? 2.5 : 4;
    gamePed.setVelocity({
      x: (this.internalPed.xsyncPed.pos.x - gamePed.pos.x) * multiplier,
      y: (this.internalPed.xsyncPed.pos.y - gamePed.pos.y) * multiplier,
      z: (this.internalPed.xsyncPed.pos.z - gamePed.pos.z) * multiplier
    });
  }
  metaTickHandler() {
    const {
      pos,
      syncedMeta: {
        health,
        isWalking,
        heading
      }
    } = this.internalPed.xsyncPed;
    if (!health) {
      this.internalPed.gamePed.health = 0;
      return;
    }
    let {
      ragdoll
    } = this.internalPed.xsyncPed.syncedMeta;
    ragdoll = !!ragdoll;
    const { gamePed } = this.internalPed;
    const now = Date.now();
    this.internalPed.gamePed.ragdoll = ragdoll;
    if (this.prevRagdoll !== ragdoll) {
      if (ragdoll)
        this.startRagdollTime = now;
      this.prevRagdoll = ragdoll;
    }
    if (now - this.startRagdollTime < 75) {
      alt9.setRotationVelocity(gamePed.scriptID, Math.random() * 5, Math.random() * 5, Math.random() * 5);
    }
    if (isWalking) {
      this.internalPed.gamePed.gotoCoord(pos, gamePed.pos.distanceTo(pos), heading);
    }
    if (!gamePed.health && health > 0)
      gamePed.resurrect(health);
    gamePed.health = health;
  }
};

// src/ped/internal/class.ts
var log3 = new Logger22("internal-ped");
var _InternalPed = class {
  constructor(xsyncPed) {
    this.xsyncPed = xsyncPed;
    const {
      id,
      pos,
      syncedMeta
    } = xsyncPed;
    this.publicInstance = new Ped(id, this);
    this.gamePed = new GamePed(xsyncPed, {
      pos,
      model: syncedMeta.model,
      health: syncedMeta.health
    });
    this.gamePed.waitForSpawn().then(() => {
      if (!xsyncPed.netOwnered)
        this.observerPed = new ObserverPed(this);
    }).catch((e) => log3.error("gamePed.waitForSpawn", e.stack));
    _InternalPed.streamedIn.add(this);
  }
  static onStreamIn(xsyncPed) {
    log3.log("onStreamIn", "ped id:", xsyncPed.id);
    _InternalPed.pedsByXsync.set(xsyncPed, new _InternalPed(xsyncPed));
  }
  static onStreamOut(xsyncPed) {
    log3.log("onStreamOut", "ped id:", xsyncPed.id);
    const ped = _InternalPed.pedsByXsync.get(xsyncPed);
    if (!ped)
      return;
    ped.destroy();
    _InternalPed.pedsByXsync.delete(xsyncPed);
  }
  static onSyncedMetaChange(xsyncPed, meta) {
    log3.log("onSyncedMetaChange", "ped id:", xsyncPed.id, meta);
    const ped = _InternalPed.pedsByXsync.get(xsyncPed);
    if (!ped)
      return;
    if (!ped.netOwnerPed)
      return;
    const {
      health
    } = meta;
    if (health != null) {
      alt10.nextTick(() => {
        ped.gamePed.health = health;
      });
    }
  }
  static onPosChange(xsyncPed, pos) {
    const ped = _InternalPed.pedsByXsync.get(xsyncPed);
    if (!ped)
      return;
    if (!ped.netOwnerPed)
      return;
    ped.gamePed.pos = pos;
  }
  static onNetOwnerChange(xsyncPed, netOwnered) {
    log3.log("onNetOwnerChange", xsyncPed.id, netOwnered);
    const ped = _InternalPed.pedsByXsync.get(xsyncPed);
    if (!ped)
      return;
    netOwnered ? ped.initNetOwner() : ped.removeNetOwner(true);
  }
  publicInstance;
  gamePed;
  valid = true;
  netOwnerPed = null;
  observerPed = null;
  sendNetOwnerPosUpdate(pos) {
    XSyncPed.pool.updateNetOwnerPos(this.xsyncPed, pos);
  }
  sendNetOwnerSyncedMetaUpdate(meta) {
    XSyncPed.pool.updateNetOwnerSyncedMeta(this.xsyncPed, meta);
  }
  destroy() {
    if (!this.valid)
      return;
    this.valid = false;
    this.gamePed.destroy();
    this.observerPed?.destroy();
    this.removeNetOwner(false);
    _InternalPed.streamedIn.delete(this);
  }
  initNetOwner() {
    if (this.netOwnerPed)
      throw new Error("initNetOwner netOwner already created");
    this.gamePed.waitForSpawn().then(() => {
      if (!this.xsyncPed.netOwnered)
        return;
      this.netOwnerPed = new NetOwnerPed(this);
      if (this.observerPed) {
        this.observerPed.destroy();
        this.observerPed = null;
      }
    }).catch((e) => log3.error("gamePed.waitForSpawn", e.stack));
  }
  removeNetOwner(createObserver) {
    this.gamePed.waitForSpawn().then(() => {
      if (!this.netOwnerPed)
        return;
      if (this.xsyncPed.netOwnered)
        return;
      this.netOwnerPed.destroy();
      this.netOwnerPed = null;
      if (!createObserver)
        return;
      if (this.observerPed)
        throw new Error("xpeds sync removeNetOwner observerPed already created");
      this.observerPed = new ObserverPed(this);
    }).catch((e) => log3.error("gamePed.waitForSpawn", e.stack));
  }
};
var InternalPed = _InternalPed;
__publicField(InternalPed, "streamedIn", /* @__PURE__ */ new Set());
__publicField(InternalPed, "pedsByXsync", /* @__PURE__ */ new Map());

// src/xsync-ped/class.ts
var XSyncPed = class extends Entity {
  static get pool() {
    if (!XSyncPed._pool)
      throw new Error("xsyncped pool is not initialized");
    return XSyncPed._pool;
  }
  static initPool(id) {
    XSyncPed._pool = new EntityPool(id, XSyncPed);
  }
};
__publicField(XSyncPed, "_pool", null);
XSyncPed = __decorateClass([
  onEntityEvents({
    streamIn: (entity) => InternalPed.onStreamIn(entity),
    streamOut: (entity) => InternalPed.onStreamOut(entity),
    posChange: (entity, pos) => InternalPed.onPosChange(entity, pos),
    syncedMetaChange: (entity, meta) => InternalPed.onSyncedMetaChange(entity, meta),
    netOwnerChange: (entity, netOwnered) => InternalPed.onNetOwnerChange(entity, netOwnered)
  })
], XSyncPed);

// src/xpeds-sync/nametags/class.ts
import * as alt11 from "alt-client";
import * as native2 from "natives";
var PedNametags = class {
  player = alt11.Player.local;
  yOffset = 0;
  fontStyle = 0;
  fontSize = 0.35;
  defaultAlpha = 215;
  barsConfig = {
    maxWidth: 0.05,
    height: 65e-4,
    border: 1e-3,
    x: 0,
    yOffset: 0.035,
    borderColor: [0, 0, 0, 100],
    hpColor: [80, 171, 80, 185],
    bgColor: [44, 77, 44, 0]
  };
  drawFromBoneId = 12844;
  drawBonePosOffset = 0.5;
  drawRange;
  handlers = [this.draw.bind(this)];
  constructor({ drawRange = 15 }) {
    this.drawRange = drawRange;
    alt11.everyTick(this.everyTickHandler.bind(this));
  }
  everyTickHandler() {
    for (const ped of InternalPed.streamedIn) {
      const dist = new alt11.Vector3(ped.gamePed.pos).distanceTo(this.player.pos);
      if (dist > this.drawRange)
        continue;
      this.drawPedTick(ped, dist);
    }
  }
  drawPedTick(ped, dist) {
    const pos = {
      ...native2.getPedBoneCoords(ped.gamePed.scriptID, this.drawFromBoneId, 0, 0, 0)
    };
    pos.z += this.drawBonePosOffset;
    const scale = 1 - 0.8 * dist / this.drawRange;
    const velocityEntity = ped.gamePed.scriptID;
    const velocityVector = native2.getEntityVelocity(velocityEntity);
    const frameTime = native2.getFrameTime();
    native2.setDrawOrigin(pos.x + velocityVector.x * frameTime, pos.y + velocityVector.y * frameTime, pos.z + velocityVector.z * frameTime, 0);
    for (const handler of this.handlers) {
      handler(ped, scale);
    }
    native2.clearDrawOrigin();
  }
  draw(ped, scale) {
    const fullName = `ped ${ped.xsyncPed.netOwnered ? "~gl~own~w~" : ""} ~b~[${ped.xsyncPed.id}]`;
    scale *= this.fontSize;
    native2.beginTextCommandDisplayText("STRING");
    native2.setTextFont(this.fontStyle);
    native2.setTextScale(scale, scale);
    native2.setTextProportional(true);
    native2.setTextCentre(true);
    native2.setTextColour(255, 255, 255, this.defaultAlpha);
    native2.setTextOutline();
    native2.addTextComponentSubstringPlayerName(fullName);
    native2.endTextCommandDisplayText(0, this.yOffset, 0);
    this.drawBars(ped, scale);
  }
  drawBars(ped, scale) {
    const {
      maxWidth,
      height,
      border,
      hpColor,
      bgColor,
      x,
      yOffset,
      borderColor
    } = this.barsConfig;
    let {
      health
    } = ped.gamePed;
    health -= 100;
    if (health < 0)
      health = 0;
    const { y: resY } = alt11.getScreenResolution();
    let y = scale * (5e-3 * (resY / 1080));
    y += yOffset;
    const width = maxWidth / 100;
    this.drawRect(x, y, maxWidth + border * 2, height + border * 2, ...borderColor);
    this.drawRect(x, y, maxWidth, height, ...bgColor);
    this.drawRect(x - width / 2 * (1 - health) - maxWidth / 2, y, width * health, height, ...hpColor);
  }
  drawRect(x, y, width, height, r, g, b, a) {
    native2.drawRect(x, y, width, height, r, g, b, a, false);
  }
};

// src/xpeds-sync/class.ts
var _XPedsSync = class {
  static get instance() {
    if (!_XPedsSync._instance)
      throw new Error("xpeds sync is not initialized");
    return _XPedsSync._instance;
  }
  log = new Logger22("main");
  onServerEvents = {
    [AltClientEvents.Init]: (pedPoolId) => {
      this.log.log("onServer init ped pool:", pedPoolId);
      XSyncPed.initPool(pedPoolId);
    }
  };
  constructor(_xsync = main_exports, options = {}) {
    if (_XPedsSync._instance)
      throw new Error("xpeds sync already initialized");
    _XPedsSync._instance = this;
    new _xsync.XSyncEntity();
    for (const eventName in this.onServerEvents)
      alt12.onServer(eventName, this.onServerEvents[eventName]);
    const {
      nametags = false
    } = options;
    if (nametags)
      new PedNametags({});
  }
};
var XPedsSync = _XPedsSync;
__publicField(XPedsSync, "_instance", null);
export {
  Ped,
  XPedsSync
};
