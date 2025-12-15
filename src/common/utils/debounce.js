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
export function debounce(fn, wait = 250, opts = {}) {
  const leading = Boolean(opts.leading);
  const trailing = opts.trailing !== false; // default true

  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let result;
  // oxlint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-unused-vars
  let lastCallTime = 0;

  function invoke() {
    timer = null;
    if (lastArgs === null) return;
    result = fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
    lastCallTime = Date.now();
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

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    const now = Date.now();
    const isInvokingLeading = leading && !timer;

    if (isInvokingLeading) {
      result = fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
      lastCallTime = now;
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
