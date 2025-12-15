function _assertClassBrand(e, t, n) {
  if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
  throw new TypeError("Private element is not present on this object");
}
function _checkPrivateRedeclaration(e, t) {
  if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
}
function _classPrivateFieldGet2(s, a) {
  return s.get(_assertClassBrand(s, a));
}
function _classPrivateFieldInitSpec(e, t, a) {
  _checkPrivateRedeclaration(e, t), t.set(e, a);
}
function _classPrivateFieldSet2(s, a, r) {
  return s.set(_assertClassBrand(s, a), r), r;
}
function _classPrivateMethodInitSpec(e, a) {
  _checkPrivateRedeclaration(e, a), a.add(e);
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

// src/common/router.js
class Router {
  constructor(routes, appState) {
    let fallbackRoute = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    this.routes = routes;
    this.appState = appState;
    this.fallbackRoute = fallbackRoute;
    this.currentView = null;
  }
  init() {
    window.addEventListener("hashchange", () => this.route());
    this.route();
  }
  async route() {
    const hash = window.location.hash || "";
    const route = this.routes.find(r => r.path === hash);
    if (!route) {
      console.warn("Route \"".concat(hash, "\" not found"));
      window.location.hash = this.fallbackRoute;
      return;
    }
    const rootElement = document.getElementById("root");
    if (this.currentView) {
      var _this$currentView;
      rootElement.classList.add("page-transition-exit");
      await this.wait(200);
      if ((_this$currentView = this.currentView) !== null && _this$currentView !== void 0 && _this$currentView.destroy) {
        this.currentView.destroy();
      }
      rootElement.classList.remove("page-transition-exit");
    }
    this.currentView = new route.view(this.appState);
    rootElement.classList.add("page-transition-enter");
    this.currentView.render();
    await this.wait(300); // Чекаємо завершення анімації входу
    rootElement.classList.remove("page-transition-enter");
    return this.currentView;
  }
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  navigateTo(hash) {
    window.location.hash = hash;
  }
}

const PATH_SEPARATOR = '.';
const TARGET = Symbol('target');
const UNSUBSCRIBE = Symbol('unsubscribe');

function isBuiltinWithMutableMethods(value) {
	return value instanceof Date
		|| value instanceof Set
		|| value instanceof Map
		|| value instanceof WeakSet
		|| value instanceof WeakMap
		|| ArrayBuffer.isView(value);
}

function isBuiltinWithoutMutableMethods(value) {
	// Primitives and null → true. Functions → false. RegExp → true.
	return value === null
		|| (typeof value !== 'object' && typeof value !== 'function')
		|| value instanceof RegExp;
}

function isSymbol(value) {
	return typeof value === 'symbol';
}

const path = {
	after(path, subPath) {
		if (Array.isArray(path)) {
			return path.slice(subPath.length);
		}

		if (subPath === '') {
			return path;
		}

		return path.slice(subPath.length + 1);
	},
	concat(path, key) {
		if (Array.isArray(path)) {
			path = [...path];

			if (key) {
				path.push(key);
			}

			return path;
		}

		if (key && key.toString !== undefined) {
			if (path !== '') {
				path += PATH_SEPARATOR;
			}

			if (isSymbol(key)) {
				return path + key.toString();
			}

			return path + key;
		}

		return path;
	},
	initial(path) {
		if (Array.isArray(path)) {
			return path.slice(0, -1);
		}

		if (path === '') {
			return path;
		}

		const index = path.lastIndexOf(PATH_SEPARATOR);

		if (index === -1) {
			return '';
		}

		return path.slice(0, index);
	},
	last(path) {
		if (Array.isArray(path)) {
			return path.at(-1) ?? '';
		}

		if (path === '') {
			return path;
		}

		const index = path.lastIndexOf(PATH_SEPARATOR);

		if (index === -1) {
			return path;
		}

		return path.slice(index + 1);
	},
	walk(path, callback) {
		if (Array.isArray(path)) {
			for (const key of path) {
				callback(key);
			}
		} else if (path !== '') {
			let position = 0;
			let index = path.indexOf(PATH_SEPARATOR);

			if (index === -1) {
				callback(path);
			} else {
				while (position < path.length) {
					if (index === -1) {
						index = path.length;
					}

					callback(path.slice(position, index));

					position = index + 1;
					index = path.indexOf(PATH_SEPARATOR, position);
				}
			}
		}
	},
	get(object, path) {
		this.walk(path, key => {
			object &&= object[key];
		});

		return object;
	},
	isSubPath(path, subPath) {
		if (Array.isArray(path)) {
			if (path.length < subPath.length) {
				return false;
			}

			// eslint-disable-next-line unicorn/no-for-loop
			for (let i = 0; i < subPath.length; i++) {
				if (path[i] !== subPath[i]) {
					return false;
				}
			}

			return true;
		}

		if (path.length < subPath.length) {
			return false;
		}

		if (path === subPath) {
			return true;
		}

		if (path.startsWith(subPath)) {
			return path[subPath.length] === PATH_SEPARATOR;
		}

		return false;
	},
	isRootPath(path) {
		if (Array.isArray(path)) {
			return path.length === 0;
		}

		return path === '';
	},
};

function isObject(value) {
	return Object.prototype.toString.call(value) === '[object Object]';
}

function isIterator(value) {
	return value !== null
		&& typeof value === 'object'
		&& typeof value.next === 'function';
}

/**
Wraps an iterator's `next()` so yielded values (or [key, value] pairs) are passed through `prepareValue` with the correct owner and path.
*/
// eslint-disable-next-line max-params
function wrapIterator(iterator, target, thisArgument, applyPath, prepareValue) {
	const originalNext = iterator?.next;
	if (typeof originalNext !== 'function') {
		return iterator;
	}

	if (target.name === 'entries') {
		iterator.next = function () {
			const result = originalNext.call(this);

			if (result && result.done === false) {
				result.value[0] = prepareValue(
					result.value[0],
					target,
					result.value[0],
					applyPath,
				);
				result.value[1] = prepareValue(
					result.value[1],
					target,
					result.value[0],
					applyPath,
				);
			}

			return result;
		};
	} else if (target.name === 'values') {
		const keyIterator = thisArgument[TARGET].keys();

		iterator.next = function () {
			const result = originalNext.call(this);

			if (result && result.done === false) {
				result.value = prepareValue(
					result.value,
					target,
					keyIterator.next().value,
					applyPath,
				);
			}

			return result;
		};
	} else {
		iterator.next = function () {
			const result = originalNext.call(this);

			if (result && result.done === false) {
				result.value = prepareValue(
					result.value,
					target,
					result.value,
					applyPath,
				);
			}

			return result;
		};
	}

	return iterator;
}

function ignoreProperty(cache, options, property) {
	if (cache.isUnsubscribed) {
		return true;
	}

	if (options.ignoreSymbols && isSymbol(property)) {
		return true;
	}

	// Only strings can be prefixed with "_"
	if (options.ignoreUnderscores && typeof property === 'string' && property.charAt(0) === '_') {
		return true;
	}

	const keys = options.ignoreKeys;
	if (keys) {
		return Array.isArray(keys) ? keys.includes(property) : (keys instanceof Set ? keys.has(property) : false);
	}

	return false;
}

/**
@class Cache
@private
*/
class Cache {
	constructor(equals) {
		this._equals = equals;
		this._proxyCache = new WeakMap();
		this._pathCache = new WeakMap();
		this._allPathsCache = new WeakMap();
		this.isUnsubscribed = false;
	}

	_pathsEqual(pathA, pathB) {
		if (!Array.isArray(pathA) || !Array.isArray(pathB)) {
			return pathA === pathB;
		}

		return pathA.length === pathB.length
			&& pathA.every((part, index) => part === pathB[index]);
	}

	_getDescriptorCache() {
		if (this._descriptorCache === undefined) {
			this._descriptorCache = new WeakMap();
		}

		return this._descriptorCache;
	}

	_getProperties(target) {
		const descriptorCache = this._getDescriptorCache();
		let properties = descriptorCache.get(target);

		if (properties === undefined) {
			properties = {};
			descriptorCache.set(target, properties);
		}

		return properties;
	}

	_getOwnPropertyDescriptor(target, property) {
		if (this.isUnsubscribed) {
			return Reflect.getOwnPropertyDescriptor(target, property);
		}

		const properties = this._getProperties(target);
		let descriptor = properties[property];

		if (descriptor === undefined) {
			descriptor = Reflect.getOwnPropertyDescriptor(target, property);
			properties[property] = descriptor;
		}

		return descriptor;
	}

	getProxy(target, path, handler, proxyTarget) {
		if (this.isUnsubscribed) {
			return target;
		}

		const reflectTarget = proxyTarget === undefined ? undefined : target[proxyTarget];
		const source = reflectTarget ?? target;

		// Always set the primary path (for backward compatibility)
		this._pathCache.set(source, path);

		// Track all paths for this object
		let allPaths = this._allPathsCache.get(source);
		if (!allPaths) {
			allPaths = [];
			this._allPathsCache.set(source, allPaths);
		}

		// Add path if it doesn't already exist
		const pathExists = allPaths.some(existingPath => this._pathsEqual(existingPath, path));
		if (!pathExists) {
			allPaths.push(path);
		}

		let proxy = this._proxyCache.get(source);

		if (proxy === undefined) {
			proxy = reflectTarget === undefined
				? new Proxy(target, handler)
				: target;

			this._proxyCache.set(source, proxy);
		}

		return proxy;
	}

	getPath(target) {
		return this.isUnsubscribed ? undefined : this._pathCache.get(target);
	}

	getAllPaths(target) {
		if (this.isUnsubscribed) {
			return undefined;
		}

		return this._allPathsCache.get(target);
	}

	isDetached(target, object) {
		return !Object.is(target, path.get(object, this.getPath(target)));
	}

	defineProperty(target, property, descriptor) {
		if (!Reflect.defineProperty(target, property, descriptor)) {
			return false;
		}

		if (!this.isUnsubscribed) {
			this._getProperties(target)[property] = descriptor;
		}

		return true;
	}

	setProperty(target, property, value, receiver, previous) { // eslint-disable-line max-params
		if (!this._equals(previous, value) || !(property in target)) {
			// Check if there's a setter anywhere in the prototype chain
			let hasSetterInChain = false;
			let current = target;
			while (current) {
				const descriptor = Reflect.getOwnPropertyDescriptor(current, property);

				if (descriptor && 'set' in descriptor) {
					hasSetterInChain = true;
					break;
				}

				current = Object.getPrototypeOf(current);
			}

			if (hasSetterInChain) {
				// Use receiver to ensure setter gets proxy as 'this'
				return Reflect.set(target, property, value, receiver);
			}

			// For simple properties, don't use receiver to maintain existing behavior
			return Reflect.set(target, property, value);
		}

		return true;
	}

	deleteProperty(target, property, previous) {
		if (Reflect.deleteProperty(target, property)) {
			if (!this.isUnsubscribed) {
				const properties = this._getDescriptorCache().get(target);

				if (properties) {
					delete properties[property];
					this._pathCache.delete(previous);
				}
			}

			return true;
		}

		return false;
	}

	isSameDescriptor(a, target, property) {
		const b = this._getOwnPropertyDescriptor(target, property);

		return a !== undefined
			&& b !== undefined
			&& Object.is(a.value, b.value)
			&& (a.writable || false) === (b.writable || false)
			&& (a.enumerable || false) === (b.enumerable || false)
			&& (a.configurable || false) === (b.configurable || false)
			&& a.get === b.get
			&& a.set === b.set;
	}

	isGetInvariant(target, property) {
		const descriptor = this._getOwnPropertyDescriptor(target, property);

		return descriptor !== undefined
			&& descriptor.configurable !== true
			&& descriptor.writable !== true;
	}

	unsubscribe() {
		this._descriptorCache = null;
		this._pathCache = null;
		this._proxyCache = null;
		this._allPathsCache = null;
		this.isUnsubscribed = true;
	}
}

var isArray = Array.isArray;

function isDiffCertain() {
	return true;
}

function isDiffArrays(clone, value) {
	if (clone === value) {
		return false;
	}

	return clone.length !== value.length
		|| clone.some((item, index) => value[index] !== item);
}

const IMMUTABLE_OBJECT_METHODS = new Set([
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'toLocaleString',
	'toString',
	'valueOf',
]);

const IMMUTABLE_ARRAY_METHODS = new Set([
	'concat',
	'includes',
	'indexOf',
	'join',
	'keys',
	'lastIndexOf',
]);

const MUTABLE_ARRAY_METHODS = {
	push: isDiffCertain,
	pop: isDiffCertain,
	shift: isDiffCertain,
	unshift: isDiffCertain,
	copyWithin: isDiffArrays,
	reverse: isDiffArrays,
	sort: isDiffArrays,
	splice: isDiffArrays,
	flat: isDiffArrays,
	fill: isDiffArrays,
};

const HANDLED_ARRAY_METHODS = new Set([
	...IMMUTABLE_OBJECT_METHODS,
	...IMMUTABLE_ARRAY_METHODS,
	...Object.keys(MUTABLE_ARRAY_METHODS),
]);

function isDiffSets(clone, value) {
	if (clone === value) {
		return false;
	}

	if (clone.size !== value.size) {
		return true;
	}

	for (const element of clone) {
		if (!value.has(element)) {
			return true;
		}
	}

	return false;
}

const COLLECTION_ITERATOR_METHODS = [
	'keys',
	'values',
	'entries',
];

const IMMUTABLE_SET_METHODS = new Set([
	'has',
	'toString',
]);

const MUTABLE_SET_METHODS = {
	add: isDiffSets,
	clear: isDiffSets,
	delete: isDiffSets,
	forEach: isDiffSets,
};

const HANDLED_SET_METHODS = new Set([
	...IMMUTABLE_SET_METHODS,
	...Object.keys(MUTABLE_SET_METHODS),
	...COLLECTION_ITERATOR_METHODS,
]);

function isDiffMaps(clone, value) {
	if (clone === value) {
		return false;
	}

	if (clone.size !== value.size) {
		return true;
	}

	for (const [key, aValue] of clone) {
		const bValue = value.get(key);
		// Distinguish missing vs undefined and catch strict inequality
		if (bValue !== aValue || (bValue === undefined && !value.has(key))) {
			return true;
		}
	}

	return false;
}

const IMMUTABLE_MAP_METHODS = new Set([...IMMUTABLE_SET_METHODS, 'get']);

const MUTABLE_MAP_METHODS = {
	set: isDiffMaps,
	clear: isDiffMaps,
	delete: isDiffMaps,
	forEach: isDiffMaps,
};

const HANDLED_MAP_METHODS = new Set([
	...IMMUTABLE_MAP_METHODS,
	...Object.keys(MUTABLE_MAP_METHODS),
	...COLLECTION_ITERATOR_METHODS,
]);

class CloneObject {
	constructor(value, path, argumentsList, hasOnValidate) {
		this._path = path;
		this._isChanged = false;
		this._clonedCache = new Set();
		this._hasOnValidate = hasOnValidate;
		this._changes = hasOnValidate ? [] : null;

		this.clone = path === undefined ? value : this._shallowClone(value);
	}

	static isHandledMethod(name) {
		return IMMUTABLE_OBJECT_METHODS.has(name);
	}

	_shallowClone(value) {
		let clone = value;

		if (isObject(value)) {
			clone = {...value};
		} else if (isArray(value) || ArrayBuffer.isView(value)) {
			clone = [...value];
		} else if (value instanceof Date) {
			clone = new Date(value);
		} else if (value instanceof Set) {
			clone = new Set([...value].map(item => this._shallowClone(item)));
		} else if (value instanceof Map) {
			clone = new Map();

			for (const [key, item] of value.entries()) {
				clone.set(key, this._shallowClone(item));
			}
		}

		this._clonedCache.add(clone);

		return clone;
	}

	preferredThisArg(isHandledMethod, name, thisArgument, thisProxyTarget) {
		if (isHandledMethod) {
			if (isArray(thisProxyTarget)) {
				this._onIsChanged = MUTABLE_ARRAY_METHODS[name];
			} else if (thisProxyTarget instanceof Set) {
				this._onIsChanged = MUTABLE_SET_METHODS[name];
			} else if (thisProxyTarget instanceof Map) {
				this._onIsChanged = MUTABLE_MAP_METHODS[name];
			}

			return thisProxyTarget;
		}

		return thisArgument;
	}

	update(fullPath, property, value) {
		const changePath = path.after(fullPath, this._path);

		if (property !== 'length') {
			let object = this.clone;

			path.walk(changePath, key => {
				if (object?.[key]) {
					if (!this._clonedCache.has(object[key])) {
						object[key] = this._shallowClone(object[key]);
					}

					object = object[key];
				}
			});

			if (this._hasOnValidate) {
				this._changes.push({
					path: changePath,
					property,
					previous: value,
				});
			}

			if (object?.[property]) {
				object[property] = value;
			}
		}

		this._isChanged = true;
	}

	undo(object) {
		let change;

		for (let index = this._changes.length - 1; index !== -1; index--) {
			change = this._changes[index];

			path.get(object, change.path)[change.property] = change.previous;
		}
	}

	isChanged(value, _equals) {
		return this._onIsChanged === undefined
			? this._isChanged
			: this._onIsChanged(this.clone, value);
	}

	isPathApplicable(changePath) {
		return path.isRootPath(this._path) || path.isSubPath(changePath, this._path);
	}
}

class CloneArray extends CloneObject {
	static isHandledMethod(name) {
		return HANDLED_ARRAY_METHODS.has(name);
	}
}

class CloneDate extends CloneObject {
	undo(object) {
		object.setTime(this.clone.getTime());
	}

	isChanged(value, equals) {
		return !equals(this.clone.valueOf(), value.valueOf());
	}
}

class CloneSet extends CloneObject {
	static isHandledMethod(name) {
		return HANDLED_SET_METHODS.has(name);
	}

	undo(object) {
		for (const value of this.clone) {
			object.add(value);
		}

		for (const value of object) {
			if (!this.clone.has(value)) {
				object.delete(value);
			}
		}
	}
}

class CloneMap extends CloneObject {
	static isHandledMethod(name) {
		return HANDLED_MAP_METHODS.has(name);
	}

	undo(object) {
		for (const [key, value] of this.clone.entries()) {
			object.set(key, value);
		}

		for (const key of object.keys()) {
			if (!this.clone.has(key)) {
				object.delete(key);
			}
		}
	}
}

class CloneWeakSet extends CloneObject {
	constructor(value, path, argumentsList, hasOnValidate) {
		super(undefined, path, argumentsList, hasOnValidate);

		this._argument1 = argumentsList[0];
		this._weakValue = value.has(this._argument1);
	}

	isChanged(value, _equals) {
		return this._weakValue !== value.has(this._argument1);
	}

	undo(object) {
		if (this._weakValue && !object.has(this._argument1)) {
			object.add(this._argument1);
		} else {
			object.delete(this._argument1);
		}
	}
}

class CloneWeakMap extends CloneObject {
	constructor(value, path, argumentsList, hasOnValidate) {
		super(undefined, path, argumentsList, hasOnValidate);

		this._weakKey = argumentsList[0];
		this._weakHas = value.has(this._weakKey);
		this._weakValue = value.get(this._weakKey);
	}

	isChanged(value, _equals) {
		return this._weakValue !== value.get(this._weakKey);
	}

	undo(object) {
		const weakHas = object.has(this._weakKey);

		if (this._weakHas && !weakHas) {
			object.set(this._weakKey, this._weakValue);
		} else if (!this._weakHas && weakHas) {
			object.delete(this._weakKey);
		} else if (this._weakValue !== object.get(this._weakKey)) {
			object.set(this._weakKey, this._weakValue);
		}
	}
}

class SmartClone {
	constructor(hasOnValidate) {
		this._stack = [];
		this._hasOnValidate = hasOnValidate;
	}

	static isHandledType(value) {
		return isObject(value)
			|| isArray(value)
			|| isBuiltinWithMutableMethods(value);
	}

	static isHandledMethod(target, name) {
		if (isObject(target)) {
			return CloneObject.isHandledMethod(name);
		}

		if (isArray(target)) {
			return CloneArray.isHandledMethod(name);
		}

		if (target instanceof Set) {
			return CloneSet.isHandledMethod(name);
		}

		if (target instanceof Map) {
			return CloneMap.isHandledMethod(name);
		}

		return isBuiltinWithMutableMethods(target);
	}

	get isCloning() {
		return this._stack.length > 0;
	}

	start(value, path, argumentsList) {
		let CloneClass = CloneObject;

		if (isArray(value)) {
			CloneClass = CloneArray;
		} else if (value instanceof Date) {
			CloneClass = CloneDate;
		} else if (value instanceof Set) {
			CloneClass = CloneSet;
		} else if (value instanceof Map) {
			CloneClass = CloneMap;
		} else if (value instanceof WeakSet) {
			CloneClass = CloneWeakSet;
		} else if (value instanceof WeakMap) {
			CloneClass = CloneWeakMap;
		}

		this._stack.push(new CloneClass(value, path, argumentsList, this._hasOnValidate));
	}

	update(fullPath, property, value) {
		this._stack.at(-1).update(fullPath, property, value);
	}

	preferredThisArg(target, thisArgument, thisProxyTarget) {
		const {name} = target;
		const isHandledMethod = SmartClone.isHandledMethod(thisProxyTarget, name);

		return this._stack.at(-1)
			.preferredThisArg(isHandledMethod, name, thisArgument, thisProxyTarget);
	}

	isChanged(value, equals) {
		return this._stack.at(-1).isChanged(value, equals);
	}

	isPartOfClone(changePath) {
		return this._stack.at(-1).isPathApplicable(changePath);
	}

	undo(object) {
		if (this._previousClone !== undefined) {
			this._previousClone.undo(object);
		}
	}

	stop() {
		this._previousClone = this._stack.pop();

		return this._previousClone.clone;
	}
}

/* eslint-disable unicorn/prefer-spread */

// Constant set of iterator method names for efficient lookup
const ITERATOR_METHOD_NAMES = new Set(['values', 'keys', 'entries']);

// Constant set of array search methods for efficient lookup
const ARRAY_SEARCH_METHODS = new Set(['indexOf', 'lastIndexOf', 'includes']);

const defaultOptions = {
	equals: Object.is,
	isShallow: false,
	pathAsArray: false,
	ignoreSymbols: false,
	ignoreUnderscores: false,
	ignoreDetached: false,
	details: false,
};

const shouldProvideApplyData = (details, methodName) => details === false
	|| details === true
	|| (Array.isArray(details) && details.includes(methodName));

const onChange = (object, onChange, options = {}) => {
	options = {
		...defaultOptions,
		...options,
	};

	const proxyTarget = Symbol('ProxyTarget');
	const {equals, isShallow, ignoreDetached, details} = options;
	const cache = new Cache(equals);
	const hasOnValidate = typeof options.onValidate === 'function';
	const smartClone = new SmartClone(hasOnValidate);

	// eslint-disable-next-line max-params
	const validate = (target, property, value, previous, applyData) => !hasOnValidate
		|| smartClone.isCloning
		|| options.onValidate(path.concat(cache.getPath(target), property), value, previous, applyData) === true;

	// eslint-disable-next-line max-params
	const handleChangeOnTarget = (target, property, value, previous, applyData) => {
		if (
			ignoreProperty(cache, options, property)
			|| (ignoreDetached && cache.isDetached(target, object))
		) {
			return;
		}

		// Determine which paths to notify
		const allPaths = cache.getAllPaths(target);
		const pathsToNotify = !smartClone.isCloning && allPaths && allPaths.length > 1
			? allPaths
			: [cache.getPath(target)];

		// Notify all relevant paths
		for (const changePath of pathsToNotify) {
			handleChange(changePath, property, value, previous, applyData);
		}
	};

	// eslint-disable-next-line max-params
	const handleChange = (changePath, property, value, previous, applyData) => {
		if (smartClone.isCloning && smartClone.isPartOfClone(changePath)) {
			smartClone.update(changePath, property, previous);
		} else {
			onChange(path.concat(changePath, property), value, previous, applyData);
		}
	};

	const getProxyTarget = value =>
		(value !== null && (typeof value === 'object' || typeof value === 'function'))
			? (value[proxyTarget] ?? value)
			: value;

	const prepareValue = (value, target, property, basePath) => {
		if (
			isBuiltinWithoutMutableMethods(value)
			|| property === 'constructor'
			|| (isShallow && !SmartClone.isHandledMethod(target, property))
			|| ignoreProperty(cache, options, property)
			|| cache.isGetInvariant(target, property)
			|| (ignoreDetached && cache.isDetached(target, object))
		) {
			return value;
		}

		if (basePath === undefined) {
			basePath = cache.getPath(target);
		}

		/*
  		Check for circular references.

  		If the value already has a corresponding path/proxy,
		and if the path corresponds to one of the parents,
		then we are on a circular case, where the child is pointing to their parent.
		In this case we return the proxy object with the shortest path.
  		*/
		const childPath = path.concat(basePath, property);
		const existingPath = cache.getPath(value);

		if (existingPath && isSameObjectTree(childPath, existingPath)) {
			// We are on the same object tree but deeper, so we use the parent path.
			return cache.getProxy(value, existingPath, handler, proxyTarget);
		}

		return cache.getProxy(value, childPath, handler, proxyTarget);
	};

	/*
	Returns true if `childPath` is a subpath of `existingPath`
	(if childPath starts with existingPath). Otherwise, it returns false.

 	It also returns false if the 2 paths are identical.

 	For example:
	- childPath    = group.layers.0.parent.layers.0.value
	- existingPath = group.layers.0.parent
	*/
	const isSameObjectTree = (childPath, existingPath) => {
		if (isSymbol(childPath) || childPath.length <= existingPath.length) {
			return false;
		}

		if (Array.isArray(existingPath) && existingPath.length === 0) {
			return false;
		}

		const childParts = Array.isArray(childPath) ? childPath : childPath.split(PATH_SEPARATOR);
		const existingParts = Array.isArray(existingPath) ? existingPath : existingPath.split(PATH_SEPARATOR);

		if (childParts.length <= existingParts.length) {
			return false;
		}

		return !(existingParts.some((part, index) => part !== childParts[index]));
	};

	// Unified handler for SmartClone-based method execution
	const handleMethodExecution = (target, thisArgument, thisProxyTarget, argumentsList) => {
		// Standard SmartClone path for all handled types including Date
		let applyPath = path.initial(cache.getPath(target));
		const isHandledMethod = SmartClone.isHandledMethod(thisProxyTarget, target.name);

		smartClone.start(thisProxyTarget, applyPath, argumentsList);

		let result;
		// Special handling for array search methods that need proxy-aware comparison
		if (Array.isArray(thisProxyTarget) && ARRAY_SEARCH_METHODS.has(target.name)) {
			result = performProxyAwareArraySearch({
				proxyArray: thisProxyTarget,
				methodName: target.name,
				searchElement: argumentsList[0],
				fromIndex: argumentsList[1],
				getProxyTarget,
			});
		} else {
			result = Reflect.apply(
				target,
				smartClone.preferredThisArg(target, thisArgument, thisProxyTarget),
				isHandledMethod
					? argumentsList.map(argument => getProxyTarget(argument))
					: argumentsList,
			);
		}

		const isChanged = smartClone.isChanged(thisProxyTarget, equals);
		const previous = smartClone.stop();

		if (SmartClone.isHandledType(result) && isHandledMethod) {
			if (thisArgument instanceof Map && target.name === 'get') {
				applyPath = path.concat(applyPath, argumentsList[0]);
			}

			result = cache.getProxy(result, applyPath, handler);
		}

		if (isChanged) {
			// Provide applyData based on details configuration
			const applyData = shouldProvideApplyData(details, target.name)
				? {
					name: target.name,
					args: argumentsList,
					result,
				}
				: undefined;

			const changePath = smartClone.isCloning
				? path.initial(applyPath)
				: applyPath;
			const property = smartClone.isCloning
				? path.last(applyPath)
				: '';

			if (validate(path.get(object, changePath), property, thisProxyTarget, previous, applyData)) {
				handleChange(changePath, property, thisProxyTarget, previous, applyData);
			} else {
				smartClone.undo(thisProxyTarget);
			}
		}

		if (
			(thisArgument instanceof Map || thisArgument instanceof Set)
			&& isIterator(result)
		) {
			return wrapIterator(result, target, thisArgument, applyPath, prepareValue);
		}

		return result;
	};

	const handler = {
		get(target, property, receiver) {
			if (isSymbol(property)) {
				if (property === proxyTarget || property === TARGET) {
					return target;
				}

				if (
					property === UNSUBSCRIBE
					&& !cache.isUnsubscribed
					&& cache.getPath(target).length === 0
				) {
					cache.unsubscribe();
					return target;
				}
			}

			const value = isBuiltinWithMutableMethods(target)
				? Reflect.get(target, property)
				: Reflect.get(target, property, receiver);

			return prepareValue(value, target, property);
		},

		set(target, property, value, receiver) {
			value = getProxyTarget(value);

			const reflectTarget = target[proxyTarget] ?? target;
			const previous = reflectTarget[property];

			if (equals(previous, value) && property in target) {
				return true;
			}

			const isValid = validate(target, property, value, previous);

			if (
				isValid
				&& cache.setProperty(reflectTarget, property, value, receiver, previous)
			) {
				handleChangeOnTarget(target, property, target[property], previous);

				return true;
			}

			return !isValid;
		},

		defineProperty(target, property, descriptor) {
			if (!cache.isSameDescriptor(descriptor, target, property)) {
				const previous = target[property];

				if (
					validate(target, property, descriptor.value, previous)
					&& cache.defineProperty(target, property, descriptor)
				) {
					// For accessor descriptors (getters/setters), descriptor.value is undefined
					// We need to get the actual value after the property is defined
					const hasValue = Object.hasOwn(descriptor, 'value');
					const value = hasValue
						? descriptor.value
						: (() => {
							try {
								// Read the actual value through the getter
								return target[property];
							} catch {
								// If the getter throws, use undefined
								return undefined;
							}
						})();

					handleChangeOnTarget(target, property, value, previous);
				}
			}

			return true;
		},

		deleteProperty(target, property) {
			if (!Reflect.has(target, property)) {
				return true;
			}

			const previous = Reflect.get(target, property);
			const isValid = validate(target, property, undefined, previous);

			if (
				isValid
				&& cache.deleteProperty(target, property, previous)
			) {
				handleChangeOnTarget(target, property, undefined, previous);

				return true;
			}

			return !isValid;
		},

		apply(target, thisArgument, argumentsList) {
			// Handle case where thisArgument is undefined/null (e.g., extracted method calls)
			const thisProxyTarget = thisArgument?.[proxyTarget] ?? thisArgument;

			if (cache.isUnsubscribed) {
				return Reflect.apply(target, thisProxyTarget, argumentsList);
			}

			// Check if SmartClone should be used for aggregate change tracking
			if (SmartClone.isHandledType(thisProxyTarget)) {
				// Skip SmartClone for custom methods on plain objects to enable property-level tracking
				// Note: This approach doesn't support private fields (#field) which require the original instance
				const isPlainObjectCustomMethod = isObject(thisProxyTarget)
					&& !SmartClone.isHandledMethod(thisProxyTarget, target.name);

				if (!isPlainObjectCustomMethod) {
					// Use SmartClone for internal methods or based on details configuration
					const isInternalMethod = typeof target.name === 'symbol'
						|| ITERATOR_METHOD_NAMES.has(target.name);

					const shouldUseSmartClone = isInternalMethod
						|| details === false
						|| (Array.isArray(details) && !details.includes(target.name));

					if (shouldUseSmartClone) {
						return handleMethodExecution(target, thisArgument, thisProxyTarget, argumentsList);
					}
				}
			}

			// Special handling for Date mutations when details option is used
			// This allows tracking Date method calls with apply data
			if (thisProxyTarget instanceof Date && SmartClone.isHandledMethod(thisProxyTarget, target.name)) {
				const previousTime = thisProxyTarget.getTime();
				const result = Reflect.apply(target, thisProxyTarget, argumentsList);
				const currentTime = thisProxyTarget.getTime();

				if (!equals(previousTime, currentTime)) {
					const applyPath = cache.getPath(thisProxyTarget);

					if (shouldProvideApplyData(details, target.name)) {
						const applyData = {
							name: target.name,
							args: argumentsList,
							result,
						};
						const previousDate = new Date(previousTime);

						if (validate(path.get(object, applyPath), '', thisProxyTarget, previousDate, applyData)) {
							handleChange(applyPath, '', thisProxyTarget, previousDate, applyData);
						} else {
							// Undo the change if validation fails
							thisProxyTarget.setTime(previousTime);
						}
					}
				}

				return result;
			}

			// For plain object custom methods or when SmartClone is not used,
			// use the proxy as 'this' to ensure property mutations go through proxy traps
			return Reflect.apply(target, thisArgument, argumentsList);
		},
	};

	const proxy = cache.getProxy(object, options.pathAsArray ? [] : '', handler);
	onChange = onChange.bind(proxy);

	if (hasOnValidate) {
		options.onValidate = options.onValidate.bind(proxy);
	}

	return proxy;
};

// Helper function for array search methods that need proxy-aware comparison
const performProxyAwareArraySearch = options => {
	const {proxyArray, methodName, searchElement, fromIndex, getProxyTarget} = options;
	const {length} = proxyArray;

	if (length === 0) {
		return methodName === 'includes' ? false : -1;
	}

	// Parse fromIndex according to ECMAScript specification
	const isLastIndexOf = methodName === 'lastIndexOf';
	let startIndex = fromIndex === undefined
		? (isLastIndexOf ? length - 1 : 0)
		: Math.trunc(Number(fromIndex)) || 0;

	if (startIndex < 0) {
		startIndex = Math.max(0, length + startIndex);
	} else if (isLastIndexOf) {
		startIndex = Math.min(startIndex, length - 1);
	}

	// Cache the search element's target for efficiency
	const searchTarget = getProxyTarget(searchElement);

	// Search with both proxy and target comparison
	const searchBackward = methodName === 'lastIndexOf';
	const endIndex = searchBackward ? -1 : length;
	const step = searchBackward ? -1 : 1;

	for (let index = startIndex; searchBackward ? index > endIndex : index < endIndex; index += step) {
		const element = proxyArray[index];
		if (element === searchElement || getProxyTarget(element) === searchTarget) {
			return methodName === 'includes' ? true : index;
		}
	}

	return methodName === 'includes' ? false : -1;
};

onChange.target = proxy => proxy?.[TARGET] ?? proxy;
onChange.unsubscribe = proxy => proxy?.[UNSUBSCRIBE] ?? proxy;

var _process$env, _window$location;
// src/common/event-bus.js
class EventBus {
  constructor() {
    this.events = new Map();
    this.debug = false;
  }

  /**
   * Enable/disable debug mode
   * @param {boolean} enabled - Whether to enable debugging
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    if (this.debug) {
      console.log("[EventBus] \uD83D\uDCE5 Subscribed to \"".concat(event, "\""), {
        totalListeners: this.events.get(event).size
      });
    }
    return () => this.off(event, callback);
  }
  off(event, callback) {
    if (!this.events.has(event)) return;
    this.events.get(event).delete(callback);
    if (this.debug) {
      console.log("[EventBus] \uD83D\uDCE4 Unsubscribed from \"".concat(event, "\""), {
        remainingListeners: this.events.get(event).size
      });
    }
  }
  emit(event, detail) {
    if (!this.events.has(event)) return;
    if (this.debug) {
      console.log("[EventBus] \uD83D\uDD14 Emitting \"".concat(event, "\""), detail);
    }
    this.events.get(event).forEach(callback => {
      try {
        callback(detail);
      } catch (error) {
        console.error("[EventBus] \u274C Error in handler for \"".concat(event, "\":"), error);
      }
    });
  }
  clear() {
    this.events.clear();
  }
}
const eventBus = new EventBus();

// Auto-enable debug in development
if (typeof process !== "undefined" && ((_process$env = process.env) === null || _process$env === void 0 ? void 0 : _process$env.NODE_ENV) === "development") {
  eventBus.setDebug(true);
}

// For browser environments, check if running on localhost
if (typeof window !== "undefined" && ((_window$location = window.location) === null || _window$location === void 0 ? void 0 : _window$location.hostname) === "localhost") {
  eventBus.setDebug(true);
}

/**
 * Base class for all views with automatic lifecycle management
 * Features:
 * - Automatic onChange subscription/cleanup
 * - Automatic EventBus subscription/cleanup
 * - Centralized header rendering logic
 * - Helper methods for DOM manipulation
 */
var _changeListeners = /*#__PURE__*/new WeakMap();
var _eventSubscriptions = /*#__PURE__*/new WeakMap();
var _elements$4 = /*#__PURE__*/new WeakMap();
class AbstractView {
  /**
   * @param {Object} appState - Application state object
   */
  constructor(appState) {
    // Private fields for automatic cleanup
    _classPrivateFieldInitSpec(this, _changeListeners, []);
    _classPrivateFieldInitSpec(this, _eventSubscriptions, new Map());
    _classPrivateFieldInitSpec(this, _elements$4, {});
    this.app = document.getElementById("root");
    this.appState = appState;

    // Automatically setup onChange for appState if provided
    if (this.appState) {
      this.appState = onChange(this.appState, this.onAppStateChange.bind(this));
      _classPrivateFieldGet2(_changeListeners, this).push({
        obj: this.appState,
        handler: this.onAppStateChange
      });
    }
  }

  /**
   * Subscribe to EventBus event with automatic cleanup
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  subscribe(event, handler) {
    eventBus.on(event, handler);
    _classPrivateFieldGet2(_eventSubscriptions, this).set(event, handler);
  }

  /**
   * Initialize local state with onChange reactivity
   * @param {Object} initialState - Initial state object
   * @param {Function} handler - State change handler
   * @returns {Proxy} Proxied state object
   */
  initLocalState(initialState, handler) {
    const state = onChange(initialState, handler.bind(this));
    _classPrivateFieldGet2(_changeListeners, this).push({
      obj: state,
      handler
    });
    return state;
  }

  /**
   * Hook called when appState changes
   * Override in child classes to react to state changes
   * @param {string} path - Changed property path
   */
  onAppStateChange(path) {
    if (path === "favorites") {
      this.updateHeader();
    }
  }

  /**
   * Render view with automatic header injection
   * @param {HTMLElement} content - Main content element
   */
  renderWithHeader(content) {
    this.app.innerHTML = "";
    if (this.hasHeader !== false) {
      _classPrivateFieldGet2(_elements$4, this).header = document.createElement("header-component");
      this.updateHeader();
      this.app.appendChild(_classPrivateFieldGet2(_elements$4, this).header);
    }
    this.app.appendChild(content);
  }

  /**
   * Update header with current favorites count
   * Called automatically when appState.favorites changes
   */
  updateHeader() {
    var _this$appState$favori;
    if (!_classPrivateFieldGet2(_elements$4, this).header || !this.appState) return;
    this.setAttribute(_classPrivateFieldGet2(_elements$4, this).header, "favorites-count", ((_this$appState$favori = this.appState.favorites) === null || _this$appState$favori === void 0 ? void 0 : _this$appState$favori.length) || 0);
  }

  /**
   * Safely set element attribute with automatic type conversion
   * @param {HTMLElement} element - Target element
   * @param {string} name - Attribute name
   * @param {*} value - Attribute value
   */
  setAttribute(element, name, value) {
    if (!element) return;
    element.setAttribute(name, String(value));
  }

  /**
   * Create element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {Array} children - Child elements or text
   * @returns {HTMLElement}
   */
  createElement(tag) {
    let attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(_ref => {
      let [key, value] = _ref;
      this.setAttribute(element, key, value);
    });
    children.forEach(child => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    });
    return element;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use constructor with appState instead
   */
  async getHtml() {
    throw new Error("getHtml() must be implemented by subclass");
  }

  /**
   * Set document title
   * @param {string} title - Page title
   */
  setTitle(title) {
    document.title = title;
  }

  /**
   * Render view content
   * Override in child classes
   */
  render() {
    return;
  }

  /**
   * Cleanup all subscriptions and listeners
   * Called automatically by router on view change
   */
  destroy() {
    // Unsubscribe from all onChange listeners
    _classPrivateFieldGet2(_changeListeners, this).forEach(_ref2 => {
      let {
        obj
      } = _ref2;
      try {
        onChange.unsubscribe(obj);
      } catch (error) {
        console.warn("Error unsubscribing from onChange:", error);
      }
    });
    _classPrivateFieldSet2(_changeListeners, this, []);

    // Unsubscribe from all EventBus subscriptions
    _classPrivateFieldGet2(_eventSubscriptions, this).forEach((handler, event) => {
      try {
        eventBus.off(event, handler);
      } catch (error) {
        console.warn("Error unsubscribing from EventBus:", error);
      }
    });
    _classPrivateFieldGet2(_eventSubscriptions, this).clear();

    // Clear elements references
    _classPrivateFieldSet2(_elements$4, this, {});
  }
}

/**
 * Application-wide event names
 * Централізоване сховище подій для EventBus
 */
const EVENTS = {
  SEARCH: "search",
  FAVORITE_TOGGLE: "favorite-toggle",
  OPEN_FILM: "open-film",
  PAGE_CHANGE: "page-change"
};

/**
 * UI Icons (SVG data URLs)
 */
const ICONS = {
  CHEVRON_LEFT: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E%3C/svg%3E",
  CHEVRON_RIGHT: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/%3E%3C/svg%3E"
};

/**
 * UI Placeholders and common text
 */
const PLACEHOLDERS = {
  IMAGE: "./static/placeholder.png",
  TEXT: "-",
  LOADING: "Loading...",
  TITLE: "Untitled"};

/**
 * Labels for UI elements
 */
const LABELS = {
  ADD_TO_FAVORITES: "Add to favorites",
  REMOVE_FROM_FAVORITES: "Remove from favorites",
  NO_DATA: "N/A"
};

/**
 * Film detail constants (legacy, можна мігрувати окремо)
 */
const FILM_DETAIL_CONSTANTS = {
  PLACEHOLDER: PLACEHOLDERS,
  NO_DATA: LABELS.NO_DATA,
  LABELS: {
    ADD_TO_FAVORITES: LABELS.ADD_TO_FAVORITES,
    REMOVE_FROM_FAVORITES: LABELS.REMOVE_FROM_FAVORITES
  }
};

var _baseUrl = /*#__PURE__*/new WeakMap();
class FilmService {
  constructor() {
    _classPrivateFieldInitSpec(this, _baseUrl, "https://www.omdbapi.com/");
  }
  async searchFilms(query) {
    let offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    try {
      const response = await fetch("".concat(_classPrivateFieldGet2(_baseUrl, this), "?s=").concat(encodeURIComponent(query), "&page=").concat(encodeURIComponent(offset), "&apikey=1163afb2"));
      if (!response.ok) {
        throw new Error("API Error: ".concat(response.status));
      }
      return await response.json();
    } catch (error) {
      console.error("FilmService Error:", error);
      throw error;
    }
  }
  async getFilmById(id) {
    try {
      const response = await fetch("".concat(_classPrivateFieldGet2(_baseUrl, this), "?i=").concat(encodeURIComponent(id), "&plot=full&apikey=1163afb2"));
      if (!response.ok) {
        throw new Error("API Error: ".concat(response.status));
      }
      return await response.json();
    } catch (error) {
      console.error("FilmService getFilmById Error:", error);
      throw error;
    }
  }
}
const filmService = new FilmService();

class FavoritesService {
  static add(appState, film) {
    const exists = appState.favorites.find(_ref => {
      let {
        imdbID
      } = _ref;
      return imdbID === film.imdbID;
    });
    if (!exists) {
      appState.favorites = [...appState.favorites, film];
    }
  }
  static remove(appState, film) {
    appState.favorites = appState.favorites.filter(_ref2 => {
      let {
        imdbID
      } = _ref2;
      return imdbID !== film.imdbID;
    });
  }
  static toggle(appState, film, isFavorite) {
    if (isFavorite) {
      this.add(appState, film);
    } else {
      this.remove(appState, film);
    }
  }
}

class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({
      mode: "closed"
    });
    this._eventBus = eventBus;
    this._unsubscribers = [];
  }
  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }
  disconnectedCallback() {
    this.cleanup();
    this._unsubscribers.forEach(unsub => unsub());
    this._unsubscribers = [];
  }
  subscribe(event, callback) {
    const unsubscribe = this._eventBus.on(event, callback.bind(this));
    this._unsubscribers.push(unsubscribe);
  }
  emitDOMEvent(eventName) {
    let detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    this.dispatchEvent(new CustomEvent(eventName, _objectSpread2({
      bubbles: true,
      composed: true,
      cancelable: true,
      detail
    }, options)));
  }
  emitGlobalEvent(eventName) {
    let detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this._eventBus.emit(eventName, detail);
  }
  emit(eventName) {
    let detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.emitDOMEvent(eventName, detail);
    this.emitGlobalEvent(eventName, detail);
  }
  createStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    return style;
  }
  adoptGlobalStyles() {
    const globalVars = "\n      :host {\n        --black: #000;\n        --white: #fff;\n      }\n    ";
    return this.createStyle(globalVars);
  }
  render() {
    throw new Error("render() must be implemented");
  }
  attachEventListeners() {
    // Override in child classes
  }
  cleanup() {
    // Override in child classes
  }
}

const styles$8 = "\n  .logo img {\n    width: 40px;\n    height: 40px;\n    object-fit: contain;\n    display: block;\n  }\n\n  .menu__item img {\n    width: 22px;\n    height: 22px;\n    object-fit: contain;\n    display: block;\n  }\n\n  :host {\n    display: block;\n    width: 100%;\n    box-sizing: border-box;\n  }\n\n  .header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    margin-bottom: 30px;\n    margin-top: 20px;\n  }\n\n  .logo {\n    display: flex;\n    align-items: center;\n  }\n\n  .menu {\n    display: flex;\n    align-items: center;\n    gap: 30px;\n  }\n\n  .menu__item {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    font-size: 14px;\n    line-height: 20px;\n    text-decoration: none;\n    color: var(--black, #000);\n    cursor: pointer;\n    transition: opacity 0.2s;\n  }\n\n  .menu__item:hover {\n    opacity: 0.7;\n  }\n\n  .menu__item:visited {\n    color: var(--black, #000);\n  }\n\n  .menu__counter {\n    font-weight: 600;\n    font-size: 12px;\n    line-height: 28px;\n    border: 1px solid var(--black, #000);\n    border-radius: 50%;\n    padding: 0 10px;\n    min-width: 28px;\n    text-align: center;\n  }\n\n  /* Slot styles */\n  ::slotted([slot=\"logo\"]) {\n    height: 40px;\n  }\n\n  ::slotted([slot=\"extra-menu\"]) {\n    margin-left: 20px;\n  }\n";
var _HeaderComponent_brand = /*#__PURE__*/new WeakSet();
class HeaderComponent extends BaseComponent {
  static get observedAttributes() {
    return ["favorites-count"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _HeaderComponent_brand);
  }
  get favoritesCount() {
    const v = Number(this.getAttribute("favorites-count"));
    return Number.isFinite(v) ? v : 0;
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "favorites-count" && oldValue !== newValue) {
      _assertClassBrand(_HeaderComponent_brand, this, _updateCounter).call(this);
    }
  }
  render() {
    this._root.innerHTML = "";
    this._root.appendChild(this.adoptGlobalStyles());
    this._root.appendChild(this.createStyle(styles$8));
    const template = document.createElement("template");
    template.innerHTML = "\n      <div class=\"header\">\n        <div class=\"logo\">\n          <slot name=\"logo\">\n            <img src=\"./static/cinema.svg\" alt=\"Logo\" />\n          </slot>\n        </div>\n        <div class=\"menu\">\n          <a class=\"menu__item\" href=\"#\" data-nav=\"search\">\n            <img src=\"./static/search.svg\" alt=\"Search icon\" />\n            <span>Search books</span>\n          </a>\n          <a class=\"menu__item\" href=\"#favorites\" data-nav=\"favorites\">\n            <img src=\"./static/favorite.svg\" alt=\"Favorites icon\" />\n            <span>Favorites</span>\n            <div class=\"menu__counter\">".concat(this.favoritesCount, "</div>\n          </a>\n          <slot name=\"extra-menu\"></slot>\n        </div>\n      </div>\n    ");
    this._root.appendChild(template.content.cloneNode(true));
  }
}
function _updateCounter() {
  const counter = this._root.querySelector(".menu__counter");
  if (!counter) return;
  counter.textContent = String(this.favoritesCount);
}
customElements.define("header-component", HeaderComponent);

/**
 * Debounce function.
 * Returns a debounced function that delays invoking `fn` until after `wait` ms
 * have elapsed since the last time the debounced function was invoked.
 * The returned function has `.cancel()` and `.flush()` helpers.
 *
 * @param {Function} fn - Function to debounce
 * @param {number} [wait=250] - Delay in ms
 * @param {Object} [opts] - Options: { leading: boolean, trailing: boolean }
 * @returns {Function} debounced
 */
function debounce(fn) {
  let wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 250;
  let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const leading = Boolean(opts.leading);
  const trailing = opts.trailing !== false; // default true

  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let result;
  function invoke() {
    timer = null;
    if (lastArgs === null) return;
    result = fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
    return result;
  }
  function startTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) invoke();
      lastArgs = lastThis = null;
    }, wait);
  }
  function debounced() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    lastArgs = args;
    lastThis = this;
    const isInvokingLeading = leading && !timer;
    if (isInvokingLeading) {
      result = fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }
    startTimer();
    return result;
  }
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = lastThis = null;
  };
  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      const res = invoke();
      timer = null;
      return res;
    }
    return result;
  };
  return debounced;
}

const styles$7 = "\n  :host {\n    display: block;\n    width: 100%;\n    box-sizing: border-box;\n  }\n\n  .wrapper {\n    position: relative;\n    display: flex;\n    width: 100%;\n    height: 100%;\n  }\n\n  input {\n    background: #DEDEDE;\n    border: none;\n    border-radius: 5px;\n    color: #252525;\n    padding: 15px 15px 15px 50px;\n    flex: 1;\n    font-size: 14px;\n    width: 100%;\n    outline: none;\n  }\n\n  input::placeholder {\n    color: #494949;\n  }\n\n  ::slotted([slot=\"icon\"]) {\n    position: absolute;\n    left: 15px;\n    top: 15px;\n    pointer-events: none;\n    width: 20px;\n    height: 20px;\n    display: block;\n  }\n";
var _debouncedOnInput = /*#__PURE__*/new WeakMap();
var _lastEmittedValue = /*#__PURE__*/new WeakMap();
var _SearchInput_brand = /*#__PURE__*/new WeakSet();
var _onInternalInput = /*#__PURE__*/new WeakMap();
var _onInternalKeydown = /*#__PURE__*/new WeakMap();
class SearchInput extends HTMLElement {
  static get observedAttributes() {
    return ["value", "placeholder"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _SearchInput_brand);
    _classPrivateFieldInitSpec(this, _debouncedOnInput, null);
    _classPrivateFieldInitSpec(this, _lastEmittedValue, "");
    _classPrivateFieldInitSpec(this, _onInternalInput, e => {
      const query = e.target.value.trim();
      if (query === _classPrivateFieldGet2(_lastEmittedValue, this)) {
        return;
      }
      _classPrivateFieldSet2(_lastEmittedValue, this, query);
      _classPrivateFieldGet2(_debouncedOnInput, this).call(this, query);
    });
    _classPrivateFieldInitSpec(this, _onInternalKeydown, e => {
      if (e.key !== "Enter" && e.code !== "Enter" && e.code !== "NumpadEnter") return;
      e.preventDefault();
      const query = e.target.value.trim();
      _classPrivateFieldSet2(_lastEmittedValue, this, query);
      this.dispatchEvent(new CustomEvent("search", {
        detail: {
          query
        },
        bubbles: true,
        composed: true
      }));
    });
    this._root = this.attachShadow({
      mode: "closed"
    });
    _classPrivateFieldSet2(_debouncedOnInput, this, debounce(query => {
      this.dispatchEvent(new CustomEvent("search-input", {
        detail: {
          query
        },
        bubbles: true,
        composed: true
      }));
    }, 300));
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case "value":
        _assertClassBrand(_SearchInput_brand, this, _updateValue$1).call(this);
        break;
      case "placeholder":
        _assertClassBrand(_SearchInput_brand, this, _updatePlaceholder$1).call(this);
        break;
    }
  }
  get value() {
    const input = this._root.querySelector("input");
    if (input) return input.value;
    return this.getAttribute("value") || "";
  }
  set value(v) {
    const input = this._root.querySelector("input");
    if (input) input.value = v || "";else this.setAttribute("value", v || "");
  }
  connectedCallback() {
    _assertClassBrand(_SearchInput_brand, this, _render$2).call(this);
    const input = this._root.querySelector("input");
    if (!input) return;
    input.addEventListener("change", _classPrivateFieldGet2(_onInternalInput, this));
    input.addEventListener("keydown", _classPrivateFieldGet2(_onInternalKeydown, this));
  }
  disconnectedCallback() {
    const input = this._root.querySelector("input");
    if (!input) return;
    input.removeEventListener("change", _classPrivateFieldGet2(_onInternalInput, this));
    input.removeEventListener("keydown", _classPrivateFieldGet2(_onInternalKeydown, this));
    if (_classPrivateFieldGet2(_debouncedOnInput, this) && typeof _classPrivateFieldGet2(_debouncedOnInput, this).cancel === "function") {
      _classPrivateFieldGet2(_debouncedOnInput, this).cancel();
    }
  }
  focus() {
    const input = this._root.querySelector("input");
    if (!input) return;
    input.focus();
  }
  cancelPending() {
    if (_classPrivateFieldGet2(_debouncedOnInput, this) && typeof _classPrivateFieldGet2(_debouncedOnInput, this).cancel === "function") {
      _classPrivateFieldGet2(_debouncedOnInput, this).cancel();
    }
  }
}
function _render$2() {
  this._root.innerHTML = "";
  this._root.appendChild(_assertClassBrand(_SearchInput_brand, this, _adoptGlobalStyles).call(this));
  this._root.appendChild(_assertClassBrand(_SearchInput_brand, this, _createStyle).call(this, styles$7));
  const template = document.createElement("template");
  template.innerHTML = "\n      <div class=\"wrapper\">\n        <input\n          type=\"text\"\n          class=\"search-input\"\n          value=\"".concat(this.getAttribute("value") || "", "\"\n          placeholder=\"").concat(this.getAttribute("placeholder") || "Find a film....", "\"\n          aria-label=\"Search input\"\n        />\n        <slot name=\"icon\"></slot>\n      </div>\n    ");
  this._root.appendChild(template.content.cloneNode(true));
}
function _updateValue$1() {
  const input = this._root.querySelector("input");
  if (!input) return;
  const attr = this.getAttribute("value") || "";
  if (input.value !== attr) input.value = attr;
}
function _updatePlaceholder$1() {
  const input = this._root.querySelector("input");
  if (!input) return;
  const attr = this.getAttribute("placeholder") || "Find a film....";
  input.placeholder = attr;
}
function _createStyle(css) {
  const style = document.createElement("style");
  style.textContent = css;
  return style;
}
function _adoptGlobalStyles() {
  const globalVars = "\n      :host {\n        --black: #000;\n        --white: #fff;\n      }\n    ";
  return _assertClassBrand(_SearchInput_brand, this, _createStyle).call(this, globalVars);
}
customElements.define("search-input", SearchInput);

const styles$6 = "\n  :host {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 6px;\n    min-width: 32px;\n    min-height: 32px;\n    box-sizing: border-box;\n    background: none;\n    border: 1px solid var(--button-border-color, #fff);\n    cursor: pointer;\n    transition: all 0.2s;\n    padding: 0;\n  }\n\n  :host(:hover) {\n    transform: scale(1.05);\n  }\n\n  :host([disabled]) {\n    opacity: 0.5;\n    cursor: not-allowed;\n    transform: none;\n    pointer-events: none;\n  }\n\n  :host(.active) {\n    background: var(--button-active-bg, #fff);\n  }\n\n  button {\n    all: inherit;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: auto;\n    height: auto;\n    border: none;\n    background: none;\n    cursor: inherit;\n    padding: 0;\n  }\n\n  ::slotted(img) {\n    display: block;\n    width: var(--icon-size, 18px);\n    height: var(--icon-size, 18px);\n    max-width: 100%;\n    max-height: 100%;\n    object-fit: contain;\n  }\n";
var _shadow$2 = /*#__PURE__*/new WeakMap();
var _button = /*#__PURE__*/new WeakMap();
var _isActive = /*#__PURE__*/new WeakMap();
var _IconButton_brand = /*#__PURE__*/new WeakSet();
var _handleKeydown = /*#__PURE__*/new WeakMap();
var _handleClick$1 = /*#__PURE__*/new WeakMap();
class IconButton extends HTMLElement {
  static get observedAttributes() {
    return ["active", "aria-label", "aria-pressed", "disabled"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _IconButton_brand);
    _classPrivateFieldInitSpec(this, _shadow$2, null);
    _classPrivateFieldInitSpec(this, _button, null);
    _classPrivateFieldInitSpec(this, _isActive, false);
    _classPrivateFieldInitSpec(this, _handleKeydown, event => {
      var _classPrivateFieldGet2$1;
      if (this.hasAttribute("disabled") && event.key !== "Enter") return;
      event.preventDefault();
      (_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_button, this)) === null || _classPrivateFieldGet2$1 === void 0 || _classPrivateFieldGet2$1.click();
    });
    _classPrivateFieldInitSpec(this, _handleClick$1, event => {
      if (this.hasAttribute("disabled")) return;
      this.dispatchEvent(new CustomEvent("icon-button-click", {
        detail: {
          event,
          active: _classPrivateFieldGet2(_isActive, this)
        },
        bubbles: true,
        composed: true
      }));
    });
    _classPrivateFieldSet2(_shadow$2, this, this.attachShadow({
      mode: "closed"
    }));
  }
  connectedCallback() {
    _assertClassBrand(_IconButton_brand, this, _render$1).call(this);
    _assertClassBrand(_IconButton_brand, this, _attachEventListeners$2).call(this);
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "button");
    }
  }
  disconnectedCallback() {
    _assertClassBrand(_IconButton_brand, this, _removeEventListeners).call(this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case "active":
        _classPrivateFieldSet2(_isActive, this, this.hasAttribute("active"));
        _assertClassBrand(_IconButton_brand, this, _updateActiveState).call(this);
        break;
      case "aria-label":
        if (_classPrivateFieldGet2(_button, this)) {
          _classPrivateFieldGet2(_button, this).setAttribute("aria-label", newValue || "");
        }
        break;
      case "aria-pressed":
        if (_classPrivateFieldGet2(_button, this)) {
          _classPrivateFieldGet2(_button, this).setAttribute("aria-pressed", newValue || "false");
        }
        break;
      case "disabled":
        if (_classPrivateFieldGet2(_button, this)) {
          _classPrivateFieldGet2(_button, this).disabled = this.hasAttribute("disabled");
        }
        _assertClassBrand(_IconButton_brand, this, _updateDisabledState).call(this);
        break;
    }
  }
  get active() {
    return _classPrivateFieldGet2(_isActive, this);
  }
  set active(value) {
    if (value) {
      this.setAttribute("active", "");
    } else {
      this.removeAttribute("active");
    }
  }
}
function _render$1() {
  const style = document.createElement("style");
  style.textContent = styles$6;
  _classPrivateFieldSet2(_button, this, document.createElement("button"));
  _classPrivateFieldGet2(_button, this).setAttribute("type", "button");
  if (this.hasAttribute("aria-label")) {
    _classPrivateFieldGet2(_button, this).setAttribute("aria-label", this.getAttribute("aria-label"));
  }
  if (this.hasAttribute("aria-pressed")) {
    _classPrivateFieldGet2(_button, this).setAttribute("aria-pressed", this.getAttribute("aria-pressed"));
  }
  if (this.hasAttribute("disabled")) {
    _classPrivateFieldGet2(_button, this).disabled = true;
  }
  const slot = document.createElement("slot");
  _classPrivateFieldGet2(_button, this).appendChild(slot);
  _classPrivateFieldGet2(_shadow$2, this).innerHTML = "";
  _classPrivateFieldGet2(_shadow$2, this).appendChild(style);
  _classPrivateFieldGet2(_shadow$2, this).appendChild(_classPrivateFieldGet2(_button, this));
  _assertClassBrand(_IconButton_brand, this, _updateActiveState).call(this);
  _assertClassBrand(_IconButton_brand, this, _updateDisabledState).call(this);
}
function _updateActiveState() {
  if (_classPrivateFieldGet2(_isActive, this)) {
    this.classList.add("active");
  } else {
    this.classList.remove("active");
  }
}
function _updateDisabledState() {
  if (this.hasAttribute("disabled")) {
    this.setAttribute("aria-disabled", "true");
    this.setAttribute("tabindex", "-1");
  } else {
    this.removeAttribute("aria-disabled");
    this.setAttribute("tabindex", "0");
  }
}
function _attachEventListeners$2() {
  this.addEventListener("keydown", _classPrivateFieldGet2(_handleKeydown, this));
  if (_classPrivateFieldGet2(_button, this)) {
    _classPrivateFieldGet2(_button, this).addEventListener("click", _classPrivateFieldGet2(_handleClick$1, this));
  }
}
function _removeEventListeners() {
  this.removeEventListener("keydown", _classPrivateFieldGet2(_handleKeydown, this));
  if (_classPrivateFieldGet2(_button, this)) {
    _classPrivateFieldGet2(_button, this).removeEventListener("click", _classPrivateFieldGet2(_handleClick$1, this));
  }
}
customElements.define("icon-button", IconButton);

const styles$5 = "\n  :host {\n    display: block;\n    width: 100%;\n    box-sizing: border-box;\n  }\n\n  .search {\n    display: flex;\n    width: 100%;\n    gap: 10px;\n    margin-bottom: 30px;\n  }\n\n  .search__button {\n    --icon-size: 30px;\n    border: none;\n    background: var(--black, #000);\n    border-radius: 5px;\n    display: flex;\n    cursor: pointer;\n    padding: 10px 20px;\n    transition: opacity 0.2s;\n  }\n\n  .search__button:hover {\n    opacity: 0.8;\n  }\n\n  .search__button:active {\n    opacity: 0.6;\n  }\n";
var _SearchComponent_brand = /*#__PURE__*/new WeakSet();
var _handleClick = /*#__PURE__*/new WeakMap();
var _handleSearch$1 = /*#__PURE__*/new WeakMap();
class SearchComponent extends BaseComponent {
  static get observedAttributes() {
    return ["query", "placeholder"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _SearchComponent_brand);
    _classPrivateFieldInitSpec(this, _handleClick, () => {
      const inputComp = this._root.querySelector("search-input");
      // Cancel any pending debounced input on the search input to avoid duplicate events
      if (inputComp && typeof inputComp.cancelPending === "function") {
        inputComp.cancelPending();
      }
      const query = inputComp ? (inputComp.value || "").trim() : "";
      this.emit("search", {
        query
      });
    });
    _classPrivateFieldInitSpec(this, _handleSearch$1, e => {
      const evtQuery = e !== null && e !== void 0 && e.detail && typeof e.detail.query === "string" ? e.detail.query.trim() : null;
      if (evtQuery != null) {
        this.emit("search", {
          query: evtQuery
        });
        return;
      }
      const inputComp = this._root.querySelector("search-input");
      const query = inputComp ? (inputComp.value || "").trim() : "";
      this.emit("search", {
        query
      });
    });
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case "query":
        _assertClassBrand(_SearchComponent_brand, this, _updateInput).call(this);
        break;
      case "placeholder":
        _assertClassBrand(_SearchComponent_brand, this, _updatePlaceholder).call(this);
        break;
    }
  }
  render() {
    this._root.innerHTML = "";
    this._root.appendChild(this.adoptGlobalStyles());
    this._root.appendChild(this.createStyle(styles$5));
    const template = document.createElement("template");
    template.innerHTML = "\n      <div class=\"search\">\n        <search-input\n          value=\"".concat(this.getAttribute("query") || "", "\"\n          placeholder=\"").concat(this.getAttribute("placeholder") || "Find a book or author....", "\"\n        >\n          <img slot=\"icon\" src=\"./static/search.svg\" alt=\"Search icon\" />\n        </search-input>\n        <icon-button class=\"search__button\" aria-label=\"Search\">\n          <img src=\"./static/search-white.svg\" alt=\"Search icon\" />\n        </icon-button>\n      </div>\n    ");
    this._root.appendChild(template.content.cloneNode(true));
  }
  attachEventListeners() {
    const button = this._root.querySelector("icon-button");
    const input = this._root.querySelector("search-input");
    if (button) button.addEventListener("icon-button-click", _classPrivateFieldGet2(_handleClick, this));
    if (input) {
      input.addEventListener("search-input", _classPrivateFieldGet2(_handleSearch$1, this));
      input.addEventListener("search", _classPrivateFieldGet2(_handleSearch$1, this));
    }
  }
  disconnectedCallback() {
    const button = this._root.querySelector("icon-button");
    const inputComp = this._root.querySelector("search-input");
    if (inputComp) {
      inputComp.removeEventListener("search-input", _classPrivateFieldGet2(_handleSearch$1, this));
      inputComp.removeEventListener("search", _classPrivateFieldGet2(_handleSearch$1, this));
    }
    if (button) button.removeEventListener("icon-button-click", _classPrivateFieldGet2(_handleClick, this));
    if (super.disconnectedCallback) super.disconnectedCallback();
  }
}
function _updateInput() {
  const inputComp = this._root.querySelector("search-input");
  if (!inputComp) return;
  const attr = this.getAttribute("query") || "";
  if (inputComp.value !== attr) inputComp.value = attr;
}
function _updatePlaceholder() {
  const inputComp = this._root.querySelector("search-input");
  if (!inputComp) return;
  const attr = this.getAttribute("placeholder") || "Find a book or author....";
  inputComp.setAttribute("placeholder", attr);
}
customElements.define("search-component", SearchComponent);

const styles$4 = "\n :host {\n   --loader-radius: 24px;\n   --loader-track-width: 4px;\n   --loader-track-color: #ADD8E6;\n   --loader-spinner-color: #A9B5EC;\n   --loader-start-angle: -45deg;\n\n   display: inline-flex;\n   align-items: center;\n   justify-content: center;\n }\n\n :host([small]) {\n   --loader-radius: 12px;\n   --loader-track-width: 3px;\n }\n\n :host([middle]) {\n   --loader-radius: 24px;\n   --loader-track-width: 4px;\n }\n\n :host([big]) {\n   --loader-radius: 48px;\n   --loader-track-width: 6px;\n }\n\n :host([hidden]) { display: none !important; }\n\n .loader {\n   width: calc(var(--loader-radius) * 2);\n   height: calc(var(--loader-radius) * 2);\n   position: relative;\n   border: calc(var(--loader-track-width)) solid var(--loader-track-color);\n   border-radius: 50%;\n   animation: spinning 1s linear infinite;\n   box-sizing: border-box;\n }\n\n .loader::after {\n   content: '';\n   width: var(--loader-radius);\n   height: var(--loader-radius);\n   border-top: calc(var(--loader-track-width)) solid var(--loader-spinner-color);\n   border-right: calc(var(--loader-track-width)) solid var(--loader-spinner-color);\n   border-top-right-radius: 100%;\n   position: absolute;\n   right: calc(-1 * var(--loader-track-width));\n   top: calc(-1 * var(--loader-track-width));\n   box-sizing: border-box;\n }\n\n @keyframes spinning {\n   from { transform: rotate(var(--loader-start-angle)); }\n   to { transform: rotate(calc(var(--loader-start-angle) + 360deg)); }\n }\n";
var _shadow$1 = /*#__PURE__*/new WeakMap();
var _LoaderComponent_brand = /*#__PURE__*/new WeakSet();
class LoaderComponent extends HTMLElement {
  static get observedAttributes() {
    return ["loading"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _LoaderComponent_brand);
    _classPrivateFieldInitSpec(this, _shadow$1, null);
    _classPrivateFieldSet2(_shadow$1, this, this.attachShadow({
      mode: "closed"
    }));
  }
  connectedCallback() {
    _assertClassBrand(_LoaderComponent_brand, this, _render).call(this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "loading") {
      const isLoading = newValue === "true";
      if (isLoading) this.removeAttribute("hidden");else this.setAttribute("hidden", "");
    }
  }
}
function _render() {
  const style = document.createElement("style");
  style.textContent = styles$4;
  const wrapper = document.createElement("div");
  wrapper.className = "loader";
  wrapper.setAttribute("part", "spinner");
  wrapper.setAttribute("aria-hidden", "true");
  _classPrivateFieldGet2(_shadow$1, this).innerHTML = "";
  _classPrivateFieldGet2(_shadow$1, this).appendChild(style);
  _classPrivateFieldGet2(_shadow$1, this).appendChild(wrapper);
}
customElements.define("loader-component", LoaderComponent);

const styles$3 = "\n  :host {\n    display: block;\n    width: 100%;\n    box-sizing: border-box;\n  }\n\n  :host([aria-busy=\"true\"]) .card-grid {\n    opacity: 0.6; pointer-events: none;\n  }\n\n  .card-list__empty {\n    text-align: center;\n    padding: 40px 20px;\n    color: var(--card-list-empty, #666);\n  }\n\n  .card-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(var(--card-min,250px), 1fr));\n    gap: var(--card-gap, 30px);\n  }\n\n  .card-list__loader {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n    \n  card-list__empty[hidden] {\n    display: none;\n  }\n\n  @media (max-width: 768px) {\n    .card-grid {\n      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n      gap: 20px;\n    }\n  }\n\n  ::slotted([slot=\"loader\"]) { width:100%; text-align:center; padding:30px; }\n\n  ::slotted([slot=\"empty\"]) { width:100%; text-align:center; padding:40px; }\n\n";
var _cards = /*#__PURE__*/new WeakMap();
var _isInited = /*#__PURE__*/new WeakMap();
var _CardListComponent_brand = /*#__PURE__*/new WeakSet();
class CardListComponent extends BaseComponent {
  static get observedAttributes() {
    return ["loading"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _CardListComponent_brand);
    _classPrivateFieldInitSpec(this, _cards, []);
    _classPrivateFieldInitSpec(this, _isInited, false);
  }
  connectedCallback() {
    if (!_classPrivateFieldGet2(_isInited, this)) {
      _assertClassBrand(_CardListComponent_brand, this, _initShell).call(this);
      _classPrivateFieldSet2(_isInited, this, true);
    }
    this.render();
  }
  get loading() {
    if (this.hasAttribute("loading")) {
      const attrValue = this.getAttribute("loading");
      return attrValue === "true";
    }
    return false;
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "loading" && oldValue !== newValue) {
      this.render();
    }
  }
  setCards(value) {
    _classPrivateFieldSet2(_cards, this, value || []);
    this.render();
  }
  render() {
    if (!this._root) return;
    this.setAttribute("aria-busy", this.loading ? "true" : "false");
    const loader = this._root.querySelector("loader-component");
    const empty = this._root.querySelector("#empty-state");
    const grid = this._root.querySelector("#card-grid");
    if (this.loading) {
      if (loader) loader.hidden = false;
      if (grid) grid.style.display = "none";
      if (empty) empty.hidden = true;
      return;
    }
    if (loader) loader.hidden = true;
    if (grid) grid.style.display = "";
    _assertClassBrand(_CardListComponent_brand, this, _renderCards).call(this);
  }
}
function _initShell() {
  this._root.appendChild(this.adoptGlobalStyles());
  this._root.appendChild(this.createStyle(styles$3));
  const template = document.createElement("template");
  template.innerHTML = "\n      <loader-component big class=\"card-list__loader\" hidden></loader-component>\n      <div class=\"card-grid\" id=\"card-grid\" role=\"list\"></div>\n      <div class=\"card-list__empty\" id=\"empty-state\" hidden>\n        <slot name=\"empty\">No films found</slot>\n      </div>\n    ";
  this._root.appendChild(template.content.cloneNode(true));
}
function _renderCards() {
  const grid = this._root.querySelector("#card-grid");
  const emptyState = this._root.querySelector("#empty-state");
  if (!grid) return;
  grid.innerHTML = "";
  if (!_classPrivateFieldGet2(_cards, this) || _classPrivateFieldGet2(_cards, this).length === 0) {
    grid.innerHTML = "";
    grid.style.display = "none";
    if (emptyState) emptyState.hidden = false;
    return;
  }
  grid.style.display = "";
  if (emptyState) emptyState.hidden = true;
  const frag = document.createDocumentFragment();
  _classPrivateFieldGet2(_cards, this).forEach(cardData => {
    const card = document.createElement("card-component");
    card.filmData = cardData;
    //card.setAttribute("film-data", JSON.stringify(cardData));
    frag.appendChild(card);
  });
  grid.innerHTML = "";
  grid.appendChild(frag);
}
customElements.define("card-list-component", CardListComponent);

const styles$2 = "\n  :host {\n    display: block;\n    box-sizing: border-box;\n  }\n\n  .card {\n    display: flex;\n    flex-direction: column;\n    border-radius: 8px;\n    overflow: hidden;\n    height: 100%;\n    cursor: pointer;\n  }\n\n  .card__image {\n    background: #B8B8B8;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 200px;\n    width: 100%;\n    overflow: hidden;\n    border-top-left-radius: 8px;\n    border-top-right-radius: 8px;\n    position: relative;\n  }\n\n  .card__image img {\n    display: block;\n    max-width: 100%;\n    max-height: 100%;\n    width: auto;\n    height: 100%;\n    object-fit: cover;\n    border-radius: 6px;\n    box-shadow: 0 2px 8px rgba(0,0,0,0.07);\n    background: #e0e0e0;\n    transition: transform 0.2s;\n  }\n\n  .card__image img:active,\n  .card__image img:focus {\n    transform: scale(1.03);\n  }\n\n  .card__info {\n    display: flex;\n    flex-direction: column;\n    background: var(--black, #000);\n    color: var(--white, #fff);\n    padding: 10px;\n    min-height: 150px;\n  }\n\n  .card__tag {\n    font-weight: 300;\n    font-size: 11px;\n    line-height: 15px;\n    margin-bottom: 3px;\n    opacity: 0.8;\n  }\n\n  .card__name {\n    font-weight: 600;\n    font-size: 15px;\n    line-height: 110%;\n    margin-bottom: 8px;\n  }\n\n  .card__author {\n    font-weight: 400;\n    font-size: 11px;\n    line-height: 15px;\n    opacity: 0.9;\n  }\n\n  .card__footer {\n    margin-top: auto;\n    display: flex;\n    padding-top: 10px;\n    gap: 8px;\n    align-items: center;\n  }\n";
var _data = /*#__PURE__*/new WeakMap();
var _filmData = /*#__PURE__*/new WeakMap();
var _CardComponent_brand = /*#__PURE__*/new WeakSet();
var _handleFavoriteToggle$4 = /*#__PURE__*/new WeakMap();
var _handleOpenFilm$1 = /*#__PURE__*/new WeakMap();
class CardComponent extends BaseComponent {
  static get observedAttributes() {
    return ["film-data", "is-favorite"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _CardComponent_brand);
    _classPrivateFieldInitSpec(this, _data, {});
    _classPrivateFieldInitSpec(this, _filmData, {});
    _classPrivateFieldInitSpec(this, _handleFavoriteToggle$4, e => {
      e.stopPropagation();
      const newState = !_classPrivateFieldGet2(_data, this).isFavorite;
      _classPrivateFieldGet2(_data, this).isFavorite = newState;
      _assertClassBrand(_CardComponent_brand, this, _updateFavoriteButton).call(this);
      this.emit("favorite-toggle", {
        film: _objectSpread2({}, _classPrivateFieldGet2(_filmData, this)),
        isFavorite: newState
      });
    });
    _classPrivateFieldInitSpec(this, _handleOpenFilm$1, e => {
      const path = e.composedPath ? e.composedPath() : [];
      if (path.some(el => el && el.tagName === "ICON-BUTTON")) return;
      this.emit("open-film", {
        imdbID: _classPrivateFieldGet2(_data, this).imdbID
      });
    });
    _classPrivateFieldSet2(_data, this, {
      id: "",
      title: "",
      year: "",
      type: "",
      poster: "",
      isFavorite: false
    });
  }
  get filmData() {
    return _classPrivateFieldGet2(_filmData, this);
  }
  set filmData(value) {
    _classPrivateFieldSet2(_filmData, this, value);
    _classPrivateFieldGet2(_data, this).imdbID = value.imdbID || "";
    _classPrivateFieldGet2(_data, this).Title = value.Title || "";
    _classPrivateFieldGet2(_data, this).Year = value.Year || "";
    _classPrivateFieldGet2(_data, this).Type = value.Type || "";
    _classPrivateFieldGet2(_data, this).Poster = value.Poster || "";
    _classPrivateFieldGet2(_data, this).isFavorite = value.isFavorite || false;
    this.render();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case "film-data":
        try {
          const parsed = typeof newValue === "string" && newValue.trim() !== "" ? JSON.parse(newValue) : newValue;
          if (parsed) this.filmData = parsed;
        } catch (err) {
          console.warn("card-component: invalid film-data attribute", err);
        }
        break;
      case "is-favorite":
        _classPrivateFieldGet2(_data, this).isFavorite = this.hasAttribute("is-favorite");
        _assertClassBrand(_CardComponent_brand, this, _updateFavoriteButton).call(this);
        break;
    }
  }
  render() {
    this._root.innerHTML = "";
    this._root.appendChild(this.adoptGlobalStyles());
    this._root.appendChild(this.createStyle(styles$2));
    const template = document.createElement("template");
    template.innerHTML = "\n      <div class=\"card\">\n        <div class=\"card__image\">\n          <img src=\"".concat(_classPrivateFieldGet2(_data, this).Poster, "\" alt=\"Book cover\" loading=\"lazy\" />\n        </div>\n        <div class=\"card__info\">\n          <div class=\"card__tag\">").concat(_classPrivateFieldGet2(_data, this).Year || "Unknown", "</div>\n          <div class=\"card__name\">").concat(_classPrivateFieldGet2(_data, this).Title || "Untitled", "</div>\n          <div class=\"card__author\">").concat(_classPrivateFieldGet2(_data, this).Type || "Unknown author", "</div>\n          <div class=\"card__footer\">\n            <icon-button\n              ").concat(_classPrivateFieldGet2(_data, this).isFavorite ? "active" : "", "\n              aria-label=\"").concat(_classPrivateFieldGet2(_data, this).isFavorite ? "Remove from favorites" : "Add to favorites", "\"\n              aria-pressed=\"").concat(_classPrivateFieldGet2(_data, this).isFavorite ? "true" : "false", "\">\n              <img src=\"").concat(_classPrivateFieldGet2(_data, this).isFavorite ? "/static/favorite.svg" : "/static/favorite-white.svg", "\" \n                   alt=\"").concat(_classPrivateFieldGet2(_data, this).isFavorite ? "Remove from favorites" : "Add to favorites", "\" />\n            </icon-button>\n            <slot name=\"actions\"></slot>\n          </div>\n        </div>\n      </div>\n    ");
    this._root.appendChild(template.content.cloneNode(true));
    _assertClassBrand(_CardComponent_brand, this, _attachEventListeners$1).call(this);
  }
  disconnectedCallback() {
    var _this$_root, _this$_root$querySele;
    const button = (_this$_root = this._root) === null || _this$_root === void 0 || (_this$_root$querySele = _this$_root.querySelector) === null || _this$_root$querySele === void 0 ? void 0 : _this$_root$querySele.call(_this$_root, "icon-button");
    if (button) button.removeEventListener("click", _classPrivateFieldGet2(_handleFavoriteToggle$4, this));
    this.removeEventListener("click", _classPrivateFieldGet2(_handleOpenFilm$1, this));
    if (super.disconnectedCallback) super.disconnectedCallback();
  }
}
function _updateFavoriteButton() {
  const button = this._root.querySelector("icon-button");
  if (!button) return;
  const ariaLabel = _classPrivateFieldGet2(_data, this).isFavorite ? "Remove from favorites" : "Add to favorites";
  const iconSrc = _classPrivateFieldGet2(_data, this).isFavorite ? "./static/favorite.svg" : "./static/favorite-white.svg";
  if (_classPrivateFieldGet2(_data, this).isFavorite) button.setAttribute("active", "");else button.removeAttribute("active");
  button.setAttribute("aria-label", ariaLabel);
  button.setAttribute("aria-pressed", _classPrivateFieldGet2(_data, this).isFavorite ? "true" : "false");
  const img = this._root.querySelector("icon-button > img");
  if (img) {
    img.src = iconSrc;
    img.alt = ariaLabel;
  }
}
function _attachEventListeners$1() {
  const button = this._root.querySelector("icon-button");
  if (!button) return;
  button.addEventListener("click", _classPrivateFieldGet2(_handleFavoriteToggle$4, this));
  this.addEventListener("click", _classPrivateFieldGet2(_handleOpenFilm$1, this));
  const img = this._root.querySelector(".card__image img");
  if (!img) return;
  img.addEventListener("error", () => {
    img.src = "./static/placeholder.png";
  }, {
    once: true
  });
}
customElements.define("card-component", CardComponent);

const styles$1 = "\n  :host {\n    display: block;\n    width: 100%;\n    box-sizing: border-box;\n  }\n\n  .pagination {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    justify-content: center;\n    margin-top: 32px;\n  }\n\n  .pagination__button {\n    min-width: 32px;\n    height: 32px;\n    padding: 0 8px;\n    border: 1px solid #e5e7eb;\n    background: #fff;\n    color: #222;\n    font-size: 14px;\n    font-weight: 400;\n    cursor: pointer;\n    transition: all 0.15s ease;\n    border-radius: 4px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n\n  .pagination__button:hover:not(:disabled):not(.pagination__button--active) {\n    border-color: #d1d5db;\n    background: #f9fafb;\n  }\n\n  .pagination__button:disabled {\n    cursor: not-allowed;\n    opacity: 0.4;\n  }\n\n  .pagination__button--active {\n    background: #000;\n    color: #fff;\n    border-color: #000;\n    font-weight: 500;\n    cursor: default;\n  }\n\n  .pagination__ellipsis {\n    min-width: 32px;\n    height: 32px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: #9ca3af;\n    font-size: 14px;\n  }\n\n  icon-button {\n    --button-border-color: #e5e7eb;\n    --icon-size: 18px;\n  }\n\n  icon-button:hover {\n    --button-border-color: #d1d5db;\n  }\n";
var _shadow = /*#__PURE__*/new WeakMap();
var _nav = /*#__PURE__*/new WeakMap();
var _prevButton = /*#__PURE__*/new WeakMap();
var _nextButton = /*#__PURE__*/new WeakMap();
var _pagesContainer = /*#__PURE__*/new WeakMap();
var _listeners = /*#__PURE__*/new WeakMap();
var _PaginationComponent_brand = /*#__PURE__*/new WeakSet();
var _previousPage = /*#__PURE__*/new WeakMap();
var _nextPage = /*#__PURE__*/new WeakMap();
class PaginationComponent extends HTMLElement {
  static get observedAttributes() {
    return ["current-page", "total-pages", "max-visible"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _PaginationComponent_brand);
    _classPrivateFieldInitSpec(this, _shadow, null);
    _classPrivateFieldInitSpec(this, _nav, null);
    _classPrivateFieldInitSpec(this, _prevButton, null);
    _classPrivateFieldInitSpec(this, _nextButton, null);
    _classPrivateFieldInitSpec(this, _pagesContainer, null);
    _classPrivateFieldInitSpec(this, _listeners, new Map());
    _classPrivateFieldInitSpec(this, _previousPage, () => {
      if (this.currentPage > 1) {
        _assertClassBrand(_PaginationComponent_brand, this, _goToPage).call(this, this.currentPage - 1);
      }
    });
    _classPrivateFieldInitSpec(this, _nextPage, () => {
      if (this.currentPage < this.totalPages) {
        _assertClassBrand(_PaginationComponent_brand, this, _goToPage).call(this, this.currentPage + 1);
      }
    });
    _classPrivateFieldSet2(_shadow, this, this.attachShadow({
      mode: "closed"
    }));
  }
  get currentPage() {
    const value = parseInt(this.getAttribute("current-page") || "1", 10);
    return _assertClassBrand(_PaginationComponent_brand, this, _validateNumber).call(this, value, 1);
  }
  set currentPage(value) {
    const validated = _assertClassBrand(_PaginationComponent_brand, this, _validateNumber).call(this, value, 1);
    this.setAttribute("current-page", String(validated));
  }
  get totalPages() {
    const value = parseInt(this.getAttribute("total-pages") || "1", 10);
    return _assertClassBrand(_PaginationComponent_brand, this, _validateNumber).call(this, value, 1);
  }
  set totalPages(value) {
    const validated = _assertClassBrand(_PaginationComponent_brand, this, _validateNumber).call(this, value, 1);
    this.setAttribute("total-pages", String(validated));
  }
  get maxVisible() {
    const value = parseInt(this.getAttribute("max-visible") || "5", 10);
    return _assertClassBrand(_PaginationComponent_brand, this, _validateNumber).call(this, value, 5);
  }
  set maxVisible(value) {
    const validated = _assertClassBrand(_PaginationComponent_brand, this, _validateNumber).call(this, value, 5);
    this.setAttribute("max-visible", String(validated));
  }
  connectedCallback() {
    _assertClassBrand(_PaginationComponent_brand, this, _initializeDOM).call(this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (!_classPrivateFieldGet2(_nav, this)) return;
    if (["current-page", "total-pages", "max-visible"].includes(name)) {
      _assertClassBrand(_PaginationComponent_brand, this, _updatePagination$1).call(this);
    }
  }

  /**
   * Calculate which page numbers should be visible based on current page and total pages.
   * Uses a sliding window algorithm with ellipsis for large page counts.
   * @returns {Array<number|string>} Array of page numbers and "..." for ellipsis
   */

  disconnectedCallback() {
    _assertClassBrand(_PaginationComponent_brand, this, _clearPageButtonListeners).call(this);
    if (_classPrivateFieldGet2(_prevButton, this)) {
      _classPrivateFieldGet2(_prevButton, this).removeEventListener("icon-button-click", _classPrivateFieldGet2(_previousPage, this));
    }
    if (_classPrivateFieldGet2(_nextButton, this)) {
      _classPrivateFieldGet2(_nextButton, this).removeEventListener("icon-button-click", _classPrivateFieldGet2(_nextPage, this));
    }
  }
}
function _validateNumber(value, defaultValue) {
  if (isNaN(value) || value < 1) {
    return defaultValue;
  }
  return Math.max(1, Math.floor(value));
}
function _calculateVisiblePages() {
  const pages = [];
  const total = this.totalPages;
  const current = this.currentPage;
  const max = this.maxVisible;
  if (total <= max) {
    // Show all pages if total is less than max
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    let start = Math.max(2, current - 1);
    const end = current <= 3 ? Math.min(max - 1, total - 1) : Math.min(total - 1, current + 1);

    // Adjust window if near the end
    if (current >= total - 2) {
      start = Math.max(2, total - (max - 2));
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push("...");
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < total - 1) {
      pages.push("...");
    }

    // Always show last page
    if (total > 1) {
      pages.push(total);
    }
  }
  return pages;
}
function _goToPage(page) {
  if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
    this.dispatchEvent(new CustomEvent("page-change", {
      detail: {
        page
      },
      bubbles: true,
      composed: true
    }));
  }
}
function _initializeDOM() {
  _classPrivateFieldGet2(_shadow, this).innerHTML = "";
  const style = document.createElement("style");
  style.textContent = styles$1;
  _classPrivateFieldGet2(_shadow, this).appendChild(style);
  _classPrivateFieldSet2(_nav, this, document.createElement("nav"));
  _classPrivateFieldGet2(_nav, this).className = "pagination";
  _classPrivateFieldGet2(_nav, this).setAttribute("aria-label", "Pagination");
  _classPrivateFieldSet2(_prevButton, this, _assertClassBrand(_PaginationComponent_brand, this, _createPrevButton).call(this));
  _classPrivateFieldGet2(_nav, this).appendChild(_classPrivateFieldGet2(_prevButton, this));
  _classPrivateFieldSet2(_pagesContainer, this, document.createElement("div"));
  _classPrivateFieldGet2(_pagesContainer, this).style.display = "contents";
  _classPrivateFieldGet2(_nav, this).appendChild(_classPrivateFieldGet2(_pagesContainer, this));
  _classPrivateFieldSet2(_nextButton, this, _assertClassBrand(_PaginationComponent_brand, this, _createNextButton).call(this));
  _classPrivateFieldGet2(_nav, this).appendChild(_classPrivateFieldGet2(_nextButton, this));
  _classPrivateFieldGet2(_shadow, this).appendChild(_classPrivateFieldGet2(_nav, this));
  _assertClassBrand(_PaginationComponent_brand, this, _updatePagination$1).call(this);
}
function _createPrevButton() {
  const prevButton = document.createElement("icon-button");
  prevButton.setAttribute("aria-label", "Previous page");
  const prevIcon = document.createElement("img");
  prevIcon.src = ICONS.CHEVRON_LEFT;
  prevIcon.alt = "previous page";
  prevButton.appendChild(prevIcon);
  prevButton.addEventListener("icon-button-click", _classPrivateFieldGet2(_previousPage, this));
  return prevButton;
}
function _createNextButton() {
  const nextButton = document.createElement("icon-button");
  nextButton.setAttribute("aria-label", "Next page");
  const nextIcon = document.createElement("img");
  nextIcon.src = ICONS.CHEVRON_RIGHT;
  nextIcon.alt = "next page";
  nextButton.appendChild(nextIcon);
  nextButton.addEventListener("icon-button-click", _classPrivateFieldGet2(_nextPage, this));
  return nextButton;
}
function _updatePagination$1() {
  _assertClassBrand(_PaginationComponent_brand, this, _updateNavigationButtons).call(this);
  _assertClassBrand(_PaginationComponent_brand, this, _updatePageButtons).call(this);
}
function _updateNavigationButtons() {
  if (this.currentPage === 1) {
    _classPrivateFieldGet2(_prevButton, this).setAttribute("disabled", "");
  } else {
    _classPrivateFieldGet2(_prevButton, this).removeAttribute("disabled");
  }
  if (this.currentPage === this.totalPages) {
    _classPrivateFieldGet2(_nextButton, this).setAttribute("disabled", "");
  } else {
    _classPrivateFieldGet2(_nextButton, this).removeAttribute("disabled");
  }
}
function _updatePageButtons() {
  _assertClassBrand(_PaginationComponent_brand, this, _clearPageButtonListeners).call(this);
  _classPrivateFieldGet2(_pagesContainer, this).innerHTML = "";
  const visiblePages = _assertClassBrand(_PaginationComponent_brand, this, _calculateVisiblePages).call(this);
  visiblePages.forEach(page => {
    if (page === "...") {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination__ellipsis";
      ellipsis.textContent = "...";
      _classPrivateFieldGet2(_pagesContainer, this).appendChild(ellipsis);
      return;
    }
    const button = _assertClassBrand(_PaginationComponent_brand, this, _createPageButton).call(this, page);
    _classPrivateFieldGet2(_pagesContainer, this).appendChild(button);
  });
}
function _createPageButton(pageNumber) {
  const button = document.createElement("button");
  button.className = "pagination__button";
  button.textContent = String(pageNumber);
  if (pageNumber === this.currentPage) {
    button.classList.add("pagination__button--active");
    button.setAttribute("aria-current", "page");
  } else {
    const clickHandler = () => _assertClassBrand(_PaginationComponent_brand, this, _goToPage).call(this, pageNumber);
    button.addEventListener("click", clickHandler);
    _classPrivateFieldGet2(_listeners, this).set(button, clickHandler);
  }
  return button;
}
function _clearPageButtonListeners() {
  _classPrivateFieldGet2(_listeners, this).forEach((handler, element) => {
    element.removeEventListener("click", handler);
  });
  _classPrivateFieldGet2(_listeners, this).clear();
}
customElements.define("pagination-component", PaginationComponent);

var _state = /*#__PURE__*/new WeakMap();
var _elements$3 = /*#__PURE__*/new WeakMap();
var _handleSearch = /*#__PURE__*/new WeakMap();
var _handleFavoriteToggle$3 = /*#__PURE__*/new WeakMap();
var _handleOpenFilm = /*#__PURE__*/new WeakMap();
var _handlePageChange = /*#__PURE__*/new WeakMap();
var _MainView_brand = /*#__PURE__*/new WeakSet();
var _stateHook = /*#__PURE__*/new WeakMap();
class MainView extends AbstractView {
  constructor(appState) {
    super(appState);
    _classPrivateMethodInitSpec(this, _MainView_brand);
    _classPrivateFieldInitSpec(this, _state, null);
    _classPrivateFieldInitSpec(this, _elements$3, {
      header: null,
      resultsHeader: null,
      cardList: null,
      pagination: null
    });
    _classPrivateFieldInitSpec(this, _handleSearch, _ref => {
      let {
        query
      } = _ref;
      if (query === _classPrivateFieldGet2(_state, this).searchQuery) {
        _assertClassBrand(_MainView_brand, this, _retrieveFilms).call(this);
        return;
      }
      _classPrivateFieldGet2(_state, this).searchQuery = query;
      _classPrivateFieldGet2(_state, this).page = 1;
      _classPrivateFieldGet2(_state, this).list = [];
    });
    _classPrivateFieldInitSpec(this, _handleFavoriteToggle$3, _ref2 => {
      let {
        film,
        isFavorite
      } = _ref2;
      FavoritesService.toggle(this.appState, film, isFavorite);
    });
    _classPrivateFieldInitSpec(this, _handleOpenFilm, _ref3 => {
      let {
        imdbID
      } = _ref3;
      if (!imdbID) return;
      this.appState.selectedFilmId = imdbID;
      window.location.hash = "#detail";
    });
    _classPrivateFieldInitSpec(this, _handlePageChange, _ref4 => {
      let {
        page
      } = _ref4;
      if (page === _classPrivateFieldGet2(_state, this).page) return;
      _classPrivateFieldGet2(_state, this).page = page;
      _classPrivateFieldGet2(_state, this).list = [];
    });
    _classPrivateFieldInitSpec(this, _stateHook, path => {
      if (path === "searchQuery" || path === "page") {
        _assertClassBrand(_MainView_brand, this, _retrieveFilms).call(this);
      }
      if (path === "list") {
        _assertClassBrand(_MainView_brand, this, _updateResultsCount).call(this);
        _assertClassBrand(_MainView_brand, this, _updateCardList$1).call(this);
      }
      if (path === "totalResults" || path === "page") {
        _assertClassBrand(_MainView_brand, this, _updatePagination).call(this);
      }
    });
    _classPrivateFieldSet2(_state, this, this.initLocalState({
      list: [],
      searchQuery: undefined,
      page: 1,
      totalResults: 0
    }, _classPrivateFieldGet2(_stateHook, this)));
    this.setTitle("Search films");
    this.subscribe(EVENTS.SEARCH, _classPrivateFieldGet2(_handleSearch, this));
    this.subscribe(EVENTS.FAVORITE_TOGGLE, _classPrivateFieldGet2(_handleFavoriteToggle$3, this));
    this.subscribe(EVENTS.OPEN_FILM, _classPrivateFieldGet2(_handleOpenFilm, this));
    this.subscribe(EVENTS.PAGE_CHANGE, _classPrivateFieldGet2(_handlePageChange, this));
  }
  render() {
    const main = document.createElement("main");
    main.classList.add("main-view");
    _classPrivateFieldGet2(_elements$3, this).resultsHeader = document.createElement("h1");
    _classPrivateFieldGet2(_elements$3, this).resultsHeader.textContent = _classPrivateFieldGet2(_state, this).totalResults ? "Books found \u2013 ".concat(_classPrivateFieldGet2(_state, this).totalResults) : "Enter a query to search";
    main.appendChild(_classPrivateFieldGet2(_elements$3, this).resultsHeader);
    const searchComponent = document.createElement("search-component");
    this.setAttribute(searchComponent, "query", _classPrivateFieldGet2(_state, this).searchQuery || "");
    main.appendChild(searchComponent);
    _classPrivateFieldGet2(_elements$3, this).cardList = document.createElement("card-list-component");
    this.setAttribute(_classPrivateFieldGet2(_elements$3, this).cardList, "loading", _classPrivateFieldGet2(_state, this).loading);
    main.appendChild(_classPrivateFieldGet2(_elements$3, this).cardList);
    _classPrivateFieldGet2(_elements$3, this).pagination = document.createElement("pagination-component");
    _classPrivateFieldGet2(_elements$3, this).pagination.addEventListener("page-change", e => {
      _classPrivateFieldGet2(_handlePageChange, this).call(this, e.detail);
    });
    main.appendChild(_classPrivateFieldGet2(_elements$3, this).pagination);
    this.renderWithHeader(main);
    _assertClassBrand(_MainView_brand, this, _updateCardList$1).call(this);
    _assertClassBrand(_MainView_brand, this, _updatePagination).call(this);
  }
}
async function _retrieveFilms() {
  this.setAttribute(_classPrivateFieldGet2(_elements$3, this).cardList, "loading", true);
  try {
    const data = await filmService.searchFilms(_classPrivateFieldGet2(_state, this).searchQuery, _classPrivateFieldGet2(_state, this).page);
    const {
      Search = [],
      totalResults = 0
    } = data;
    _classPrivateFieldGet2(_state, this).totalResults = totalResults;
    _classPrivateFieldGet2(_state, this).list = [..._classPrivateFieldGet2(_state, this).list, ...Search];
  } catch (error) {
    console.error("Error loading books:", error);
  } finally {
    this.setAttribute(_classPrivateFieldGet2(_elements$3, this).cardList, "loading", false);
  }
}
function _updateResultsCount() {
  if (!_classPrivateFieldGet2(_elements$3, this).resultsHeader) return;
  _classPrivateFieldGet2(_elements$3, this).resultsHeader.textContent = _classPrivateFieldGet2(_state, this).totalResults ? "Films found \u2013 ".concat(_classPrivateFieldGet2(_state, this).totalResults) : "Enter a query to search";
}
function _updateCardList$1() {
  if (!_classPrivateFieldGet2(_elements$3, this).cardList) return;
  const filmsWithFavorites = _classPrivateFieldGet2(_state, this).list.map(film => _objectSpread2(_objectSpread2({}, film), {}, {
    isFavorite: this.appState.favorites.some(_ref5 => {
      let {
        id
      } = _ref5;
      return id === film.imdbID;
    })
  }));
  _classPrivateFieldGet2(_elements$3, this).cardList.setCards(filmsWithFavorites);
}
function _updatePagination() {
  if (!_classPrivateFieldGet2(_elements$3, this).pagination) return;
  const totalPages = Math.ceil(_classPrivateFieldGet2(_state, this).totalResults / 10);
  this.setAttribute(_classPrivateFieldGet2(_elements$3, this).pagination, "current-page", _classPrivateFieldGet2(_state, this).page);
  this.setAttribute(_classPrivateFieldGet2(_elements$3, this).pagination, "total-pages", totalPages);
  _classPrivateFieldGet2(_elements$3, this).pagination.style.display = totalPages <= 1 ? "none" : "block";
}

var _elements$2 = /*#__PURE__*/new WeakMap();
var _handleFavoriteToggle$2 = /*#__PURE__*/new WeakMap();
var _FavoritesView_brand = /*#__PURE__*/new WeakSet();
class FavoritesView extends AbstractView {
  constructor(appState) {
    super(appState);
    _classPrivateMethodInitSpec(this, _FavoritesView_brand);
    _classPrivateFieldInitSpec(this, _elements$2, {
      header: null,
      cardList: null
    });
    _classPrivateFieldInitSpec(this, _handleFavoriteToggle$2, _ref => {
      let {
        film,
        isFavorite
      } = _ref;
      if (isFavorite) return;
      FavoritesService.remove(this.appState, film);
    });
    this.setTitle("My Favorites books");
    this.subscribe(EVENTS.FAVORITE_TOGGLE, _classPrivateFieldGet2(_handleFavoriteToggle$2, this));
  }
  render() {
    const main = document.createElement("main");
    const title = document.createElement("h1");
    title.textContent = "Favorites";
    main.appendChild(title);
    _classPrivateFieldGet2(_elements$2, this).cardList = document.createElement("card-list-component");
    main.appendChild(_classPrivateFieldGet2(_elements$2, this).cardList);
    this.renderWithHeader(main);
    _assertClassBrand(_FavoritesView_brand, this, _updateCardList).call(this);
  }
}
function _updateCardList() {
  if (!_classPrivateFieldGet2(_elements$2, this).cardList) return;
  const favoritesWithFlag = this.appState.favorites.map(film => _objectSpread2(_objectSpread2({}, film), {}, {
    isFavorite: true
  }));
  _classPrivateFieldGet2(_elements$2, this).cardList.setCards(favoritesWithFlag);
}

const template = document.createElement("template");
const style = document.createElement("style");
style.textContent = "\n    :host([description]), :host([tags]) {\n      display: flex;\n      flex-direction: column;\n      gap: var(--detail-row-gap, 8px);\n    }\n\n    :host([description]) .label,\n    :host([tags]) .label {\n      margin: var(--detail-row-label-margin, 24px 0 8px 0);\n      font-weight: var(--detail-row-label-weight, 600);\n      font-size: var(--detail-row-label-size, 16px);\n      color: var(--detail-row-label-color, inherit);\n    }\n\n    :host([description]) .value {\n      line-height: var(--detail-row-value-line-height, 1.6);\n      color: var(--detail-row-value-color, #333);\n    }\n\n    :host([tags]) .value {\n      display: flex;\n      gap: var(--detail-row-tags-gap, 10px);\n      flex-wrap: wrap;\n      margin-top: var(--detail-row-tags-margin-top, 8px);\n    }\n\n    .tag {\n      border: 1px solid var(--detail-row-tag-border-color, #222);\n      padding: var(--detail-row-tag-padding, 6px 10px);\n      border-radius: var(--detail-row-tag-radius, 8px);\n      background: var(--detail-row-tag-bg, transparent);\n      color: var(--detail-row-tag-color, #222);\n      font-size: var(--detail-row-tag-font-size, inherit);\n      transition: var(--detail-row-tag-transition, none);\n    }\n\n    .tag:hover {\n      background: var(--detail-row-tag-hover-bg, rgba(0, 0, 0, 0.05));\n    }\n\n    .value:empty::before {\n      content: var(--detail-row-empty-text, '\u2014');\n      color: var(--detail-row-empty-color, #999);\n    }\n";
const label = document.createElement("div");
label.className = "label";
const value = document.createElement("div");
value.className = "value";
template.content.append(style, label, value);
var _root = /*#__PURE__*/new WeakMap();
var _labelEl = /*#__PURE__*/new WeakMap();
var _valueEl = /*#__PURE__*/new WeakMap();
var _currentValue = /*#__PURE__*/new WeakMap();
var _currentMode = /*#__PURE__*/new WeakMap();
var _DetailRow_brand = /*#__PURE__*/new WeakSet();
class DetailRow extends HTMLElement {
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _DetailRow_brand);
    _classPrivateFieldInitSpec(this, _root, void 0);
    _classPrivateFieldInitSpec(this, _labelEl, void 0);
    _classPrivateFieldInitSpec(this, _valueEl, void 0);
    _classPrivateFieldInitSpec(this, _currentValue, null);
    _classPrivateFieldInitSpec(this, _currentMode, null);
    _classPrivateFieldSet2(_root, this, this.attachShadow({
      mode: "closed"
    }));
    _classPrivateFieldGet2(_root, this).appendChild(template.content.cloneNode(true));
    _classPrivateFieldSet2(_labelEl, this, _classPrivateFieldGet2(_root, this).querySelector(".label"));
    _classPrivateFieldSet2(_valueEl, this, _classPrivateFieldGet2(_root, this).querySelector(".value"));
  }
  static get observedAttributes() {
    return ["label", "value", "tags", "description"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
      case "label":
        _assertClassBrand(_DetailRow_brand, this, _updateLabel).call(this, newValue);
        break;
      case "value":
        _assertClassBrand(_DetailRow_brand, this, _updateValue).call(this, newValue);
        break;
      case "tags":
      case "description":
        _assertClassBrand(_DetailRow_brand, this, _updateValue).call(this, this.getAttribute("value"));
        break;
    }
  }
  connectedCallback() {
    _assertClassBrand(_DetailRow_brand, this, _updateLabel).call(this, this.getAttribute("label"));
    _assertClassBrand(_DetailRow_brand, this, _updateValue).call(this, this.getAttribute("value"));
  }
  setLabel(label) {
    this.setAttribute("label", label);
  }
  setValue(value) {
    this.setAttribute("value", value);
  }
  setTags(tags) {
    if (Array.isArray(tags)) {
      this.setAttribute("value", tags.join(", "));
      this.setAttribute("tags", "");
    }
  }
}
function _updateLabel(label) {
  _classPrivateFieldGet2(_labelEl, this).textContent = label || "";
}
function _updateValue(value) {
  const normalizedValue = value || "";
  const isTagsMode = this.hasAttribute("tags");
  if (_classPrivateFieldGet2(_currentValue, this) === normalizedValue && _classPrivateFieldGet2(_currentMode, this) === isTagsMode) {
    return;
  }
  _classPrivateFieldSet2(_currentValue, this, normalizedValue);
  _classPrivateFieldSet2(_currentMode, this, isTagsMode);
  if (isTagsMode) {
    _assertClassBrand(_DetailRow_brand, this, _renderTags).call(this, normalizedValue);
  } else {
    _assertClassBrand(_DetailRow_brand, this, _renderText).call(this, normalizedValue);
  }
}
function _renderText(text) {
  _classPrivateFieldGet2(_valueEl, this).textContent = text;
}
function _renderTags(tagsString) {
  const tags = _assertClassBrand(_DetailRow_brand, this, _parseTags).call(this, tagsString);
  const fragment = document.createDocumentFragment();
  tags.forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    span.setAttribute("role", "listitem");
    fragment.appendChild(span);
  });
  _classPrivateFieldGet2(_valueEl, this).replaceChildren(fragment);
  if (tags.length > 0) {
    _classPrivateFieldGet2(_valueEl, this).setAttribute("role", "list");
  } else {
    _classPrivateFieldGet2(_valueEl, this).removeAttribute("role");
  }
}
function _parseTags(tagsString) {
  if (!tagsString) return [];
  return tagsString.split(",").map(tag => tag.trim()).filter(Boolean);
}
customElements.define("detail-row", DetailRow);

const styles = "\n:host {\n  display: block;\n}\n.wrapper {\n  display: flex;\n  gap: 20px;\n  flex-direction: column;\n}\n.container {\n  display: flex;\n  gap: 40px;\n}\n.poster {\n  width: 200px;\n  border-radius: 8px;\n  overflow: hidden;\n  box-shadow: 0 10px 30px rgba(2,6,23,0.06);\n  flex-shrink: 0;\n}\n.poster img {\n  display: block;\n  width: 100%;\n  height: auto;\n  object-fit: cover;\n  min-height: 300px; /* Prevent layout shift */\n  background: #f0f0f0;\n}\n.content {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\nicon-button {\n  background: var(--black, #000);\n  color: var(--white, #fff);\n  padding: 12px 22px;\n  border-radius: 8px;\n  font-weight: 600;\n  width: 200px;\n}\n.title {\n  margin: 0;\n  font-size: 32px;\n  font-weight: 700;\n  color: var(--text-color, #111);\n}\n.details-list {\n  flex: .8;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\n.details-list detail-row {\n  display: grid;\n  grid-template-columns: 85px auto;\n  align-items: center;\n}\n";
var _elements$1 = /*#__PURE__*/new WeakMap();
var _details = /*#__PURE__*/new WeakMap();
var _FilmDetailsInfo_brand = /*#__PURE__*/new WeakSet();
var _handleFavoriteToggle$1 = /*#__PURE__*/new WeakMap();
class FilmDetailsInfo extends BaseComponent {
  static get observedAttributes() {
    return ["is-favorite"];
  }
  constructor() {
    super();
    _classPrivateMethodInitSpec(this, _FilmDetailsInfo_brand);
    _classPrivateFieldInitSpec(this, _elements$1, {});
    _classPrivateFieldInitSpec(this, _details, null);
    _classPrivateFieldInitSpec(this, _handleFavoriteToggle$1, () => {
      if (!_classPrivateFieldGet2(_details, this)) return;
      const newFavoriteState = !this.isFavorite;
      this.emit("favorite-toggle", {
        film: {
          imdbID: _classPrivateFieldGet2(_details, this).imdbID,
          Title: _classPrivateFieldGet2(_details, this).Title,
          Poster: _classPrivateFieldGet2(_details, this).Poster,
          Year: _classPrivateFieldGet2(_details, this).Year,
          Type: _classPrivateFieldGet2(_details, this).Type,
          isFavorite: newFavoriteState
        },
        isFavorite: newFavoriteState
      });
    });
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "is-favorite") {
      _assertClassBrand(_FilmDetailsInfo_brand, this, _updateButtonState$1).call(this, newValue === "true");
    }
  }
  get isFavorite() {
    return this.getAttribute("is-favorite") === "true";
  }
  connectedCallback() {
    this.render();
  }
  disconnectedCallback() {
    _assertClassBrand(_FilmDetailsInfo_brand, this, _cleanup).call(this);
  }

  /**
   * Main public method to update component state
   */
  setDetails(_ref) {
    let {
      details,
      isFavorite
    } = _ref;
    if (!details) {
      console.warn("FilmDetailsInfo: No details provided");
      return;
    }
    _classPrivateFieldSet2(_details, this, details);
    const filmData = _assertClassBrand(_FilmDetailsInfo_brand, this, _extractFilmData).call(this, details);

    // Update DOM elements directly instead of re-rendering HTML
    _assertClassBrand(_FilmDetailsInfo_brand, this, _updateView).call(this, filmData);
    _assertClassBrand(_FilmDetailsInfo_brand, this, _updateButtonState$1).call(this, isFavorite);
  }
  render() {
    const style = document.createElement("style");
    style.textContent = styles;
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    const container = document.createElement("div");
    container.className = "container";

    // Poster
    const poster = document.createElement("div");
    poster.className = "poster";
    const img = document.createElement("img");
    img.id = "poster-img";
    img.src = FILM_DETAIL_CONSTANTS.PLACEHOLDER.IMAGE;
    img.alt = "Poster";
    poster.appendChild(img);

    // Content
    const content = document.createElement("div");
    content.className = "content";
    const title = document.createElement("h1");
    title.className = "title";
    title.id = "film-title";
    title.textContent = FILM_DETAIL_CONSTANTS.PLACEHOLDER.LOADING;
    const detailsList = document.createElement("div");
    detailsList.className = "details-list";
    const rows = [{
      id: "writer",
      label: "Writer :"
    }, {
      id: "genre",
      label: "Category :"
    }, {
      id: "actors",
      label: "Actors :"
    }, {
      id: "rating",
      label: "Ratings :"
    }, {
      id: "year",
      label: "Released"
    }, {
      id: "runtime",
      label: "Minutes:"
    }, {
      id: "director",
      label: "Director:"
    }];
    rows.forEach(_ref2 => {
      let {
        id,
        label
      } = _ref2;
      const row = document.createElement("detail-row");
      row.dataset.id = id;
      row.setAttribute("label", label);
      detailsList.appendChild(row);
    });
    const button = document.createElement("icon-button");
    button.setAttribute("aria-label", FILM_DETAIL_CONSTANTS.LABELS.ADD_TO_FAVORITES);
    button.textContent = FILM_DETAIL_CONSTANTS.LABELS.ADD_TO_FAVORITES;
    content.append(title, detailsList, button);
    container.append(poster, content);
    const plotRow = document.createElement("detail-row");
    plotRow.dataset.id = "plot";
    plotRow.setAttribute("description", "");
    plotRow.setAttribute("label", "Description:");
    const tagsRow = document.createElement("detail-row");
    tagsRow.dataset.id = "tags";
    tagsRow.setAttribute("tags", "");
    tagsRow.setAttribute("label", "Tags:");
    wrapper.append(container, plotRow, tagsRow);
    this._root.replaceChildren(style, wrapper);
    _assertClassBrand(_FilmDetailsInfo_brand, this, _cacheElements).call(this);
    _assertClassBrand(_FilmDetailsInfo_brand, this, _attachEventListeners).call(this);
  }
}
function _cacheElements() {
  const $ = selector => this._root.querySelector(selector);
  _classPrivateFieldSet2(_elements$1, this, {
    poster: $("#poster-img"),
    title: $("#film-title"),
    button: $("icon-button"),
    rows: {
      writer: $('[data-id="writer"]'),
      genre: $('[data-id="genre"]'),
      actors: $('[data-id="actors"]'),
      rating: $('[data-id="rating"]'),
      year: $('[data-id="year"]'),
      runtime: $('[data-id="runtime"]'),
      director: $('[data-id="director"]'),
      plot: $('[data-id="plot"]'),
      tags: $('[data-id="tags"]')
    }
  });
}
function _updateView(data) {
  const {
    poster,
    title,
    rows
  } = _classPrivateFieldGet2(_elements$1, this);

  // Update simple elements
  if (poster) {
    poster.src = data.posterUrl;
    poster.alt = data.title;
  }
  if (title) {
    title.textContent = data.title;
  }

  // Update detail rows
  const mapping = {
    writer: data.writer,
    genre: data.genre,
    actors: data.actors,
    rating: data.rating,
    year: data.year,
    runtime: data.runtime,
    director: data.director,
    plot: data.plot,
    tags: data.tags
  };
  Object.entries(mapping).forEach(_ref3 => {
    let [key, value] = _ref3;
    if (rows[key]) {
      rows[key].setAttribute("value", value);
    }
  });
}
function _updateButtonState$1(value) {
  const isFav = value === true || value === "true";
  const btn = _classPrivateFieldGet2(_elements$1, this).button;
  if (!btn) return;
  const label = isFav ? FILM_DETAIL_CONSTANTS.LABELS.REMOVE_FROM_FAVORITES : FILM_DETAIL_CONSTANTS.LABELS.ADD_TO_FAVORITES;
  if (isFav) {
    btn.setAttribute("active", "");
  } else {
    btn.removeAttribute("active");
  }
  btn.setAttribute("aria-pressed", String(isFav));
  btn.setAttribute("aria-label", label);
  btn.textContent = label;
}
function _attachEventListeners() {
  if (_classPrivateFieldGet2(_elements$1, this).button) {
    _classPrivateFieldGet2(_elements$1, this).button.addEventListener("click", _classPrivateFieldGet2(_handleFavoriteToggle$1, this));
  }
}
function _cleanup() {
  if (_classPrivateFieldGet2(_elements$1, this).button) {
    _classPrivateFieldGet2(_elements$1, this).button.removeEventListener("click", _classPrivateFieldGet2(_handleFavoriteToggle$1, this));
  }
  _classPrivateFieldSet2(_elements$1, this, {});
  _classPrivateFieldSet2(_details, this, null);
}
function _extractFilmData(details) {
  return {
    posterUrl: _assertClassBrand(_FilmDetailsInfo_brand, this, _getValidValue).call(this, details.Poster, FILM_DETAIL_CONSTANTS.PLACEHOLDER.IMAGE),
    title: details.Title || FILM_DETAIL_CONSTANTS.PLACEHOLDER.TITLE,
    writer: _assertClassBrand(_FilmDetailsInfo_brand, this, _getValidValue).call(this, details.Writer),
    genre: details.Genre || FILM_DETAIL_CONSTANTS.PLACEHOLDER.TEXT,
    actors: _assertClassBrand(_FilmDetailsInfo_brand, this, _getValidValue).call(this, details.Actors),
    year: details.Released || FILM_DETAIL_CONSTANTS.PLACEHOLDER.TEXT,
    runtime: details.Runtime || FILM_DETAIL_CONSTANTS.PLACEHOLDER.TEXT,
    director: details.Director || FILM_DETAIL_CONSTANTS.PLACEHOLDER.TEXT,
    plot: details.Plot || "",
    rating: _assertClassBrand(_FilmDetailsInfo_brand, this, _buildRating).call(this, details),
    tags: details.Genre || []
  };
}
function _getValidValue(value) {
  let placeholder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : FILM_DETAIL_CONSTANTS.PLACEHOLDER.TEXT;
  return value && value !== FILM_DETAIL_CONSTANTS.NO_DATA ? value : placeholder;
}
function _buildRating(details) {
  const ratingParts = [];
  if (details.imdbRating && details.imdbRating !== FILM_DETAIL_CONSTANTS.NO_DATA) {
    ratingParts.push("".concat(details.imdbRating, "/10"));
  }
  if (details.Metascore && details.Metascore !== FILM_DETAIL_CONSTANTS.NO_DATA) {
    ratingParts.push("".concat(details.Metascore, " Metascore"));
  }
  if (Array.isArray(details.Ratings)) {
    const rottenTomatoes = details.Ratings.find(r => r.Source === "Rotten Tomatoes");
    if (rottenTomatoes !== null && rottenTomatoes !== void 0 && rottenTomatoes.Value) {
      ratingParts.push(rottenTomatoes.Value);
    }
  }
  return ratingParts.length > 0 ? ratingParts.join(" • ") : FILM_DETAIL_CONSTANTS.PLACEHOLDER.TEXT;
}
customElements.define("film-details", FilmDetailsInfo);

var _elements = /*#__PURE__*/new WeakMap();
var _DetailView_brand = /*#__PURE__*/new WeakSet();
var _handleFavoriteToggle = /*#__PURE__*/new WeakMap();
class DetailView extends AbstractView {
  constructor(appState) {
    super(appState);
    _classPrivateMethodInitSpec(this, _DetailView_brand);
    _classPrivateFieldInitSpec(this, _elements, {
      detailsInfo: null,
      loader: null
    });
    _classPrivateFieldInitSpec(this, _handleFavoriteToggle, _ref => {
      let {
        film,
        isFavorite
      } = _ref;
      FavoritesService.toggle(this.appState, film, isFavorite);
    });
    this.setTitle("Film details");
    this.subscribe(EVENTS.FAVORITE_TOGGLE, _classPrivateFieldGet2(_handleFavoriteToggle, this));
  }
  async render() {
    const main = document.createElement("main");
    main.classList.add("detail-view");
    const style = document.createElement("style");
    style.textContent = "\n      .detail-view {\n        display: block;\n        box-sizing: border-box;\n        padding: 30px 20px;\n        background: var(--page-bg, #fff);\n        color: var(--text-color, #111);\n      }\n      .detail {\n        max-width: 1100px;\n        margin: 0 auto;\n        display: flex;\n        flex-direction: column;\n        gap: 20px;\n      }\n      [data-page-loader] {\n        position: fixed;\n        inset: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: rgba(255,255,255,0.75);\n        z-index: 9999;\n      }\n    ";
    main.appendChild(style);
    const detailContainer = document.createElement("div");
    detailContainer.classList.add("detail");
    _classPrivateFieldGet2(_elements, this).detailsInfo = document.createElement("film-details");
    detailContainer.appendChild(_classPrivateFieldGet2(_elements, this).detailsInfo);
    main.appendChild(detailContainer);
    _classPrivateFieldGet2(_elements, this).loader = document.createElement("div");
    _classPrivateFieldGet2(_elements, this).loader.setAttribute("data-page-loader", "");
    const loaderComponent = document.createElement("loader-component");
    loaderComponent.setAttribute("big", "");
    _classPrivateFieldGet2(_elements, this).loader.appendChild(loaderComponent);
    main.appendChild(_classPrivateFieldGet2(_elements, this).loader);
    this.renderWithHeader(main);
    const imdbID = this.appState.selectedFilmId;
    if (!imdbID) {
      _classPrivateFieldGet2(_elements, this).loader.remove();
      return;
    }
    await _assertClassBrand(_DetailView_brand, this, _loadFilmDetails).call(this, imdbID);
  }
  onAppStateChange(path) {
    super.onAppStateChange(path);
    if (path === "favorites") {
      _assertClassBrand(_DetailView_brand, this, _updateButtonState).call(this);
    }
  }
}
async function _loadFilmDetails(imdbID) {
  try {
    const details = await filmService.getFilmById(imdbID);
    _assertClassBrand(_DetailView_brand, this, _updateDetailsInfo).call(this, details);
  } catch (err) {
    console.error("DetailView load error", err);
  } finally {
    if (_classPrivateFieldGet2(_elements, this).loader) {
      _classPrivateFieldGet2(_elements, this).loader.remove();
    }
  }
}
function _updateDetailsInfo(details) {
  const isFavorite = this.appState.favorites.some(f => f.imdbID === details.imdbID || f.id === details.imdbID);
  _classPrivateFieldGet2(_elements, this).detailsInfo.setDetails({
    details,
    isFavorite
  });
}
function _updateButtonState() {
  if (!_classPrivateFieldGet2(_elements, this).detailsInfo) return;
  const isFavorite = this.appState.favorites.some(_ref2 => {
    let {
      imdbID
    } = _ref2;
    return imdbID === this.appState.selectedFilmId;
  });
  _classPrivateFieldGet2(_elements, this).detailsInfo.setAttribute("is-favorite", String(isFavorite));
}

class App {
  constructor() {
    _defineProperty(this, "appState", {
      favorites: [],
      selectedFilmId: null
    });
    const routes = [{
      path: "",
      view: MainView
    }, {
      path: "#favorites",
      view: FavoritesView
    }, {
      path: "#detail",
      view: DetailView
    }];
    this.router = new Router(routes, this.appState, "");
    this.router.init();
  }
}
new App();

export { App as default };
//# debugId=2eb579cf-f0db-494b-8c64-d42b97209513
//# sourceMappingURL=app.js.map
