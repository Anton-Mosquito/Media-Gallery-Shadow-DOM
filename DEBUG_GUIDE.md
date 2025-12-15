# EventBus Debug Guide

## Overview

The EventBus provides built-in debugging capabilities to help track event flow throughout the application.

## Automatic Debug Mode

Debug mode is **automatically enabled** in development environments:

```javascript
// src/common/event-bus.js
if (typeof window !== "undefined") {
  const isDev = 
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    process.env.NODE_ENV === "development";

  if (isDev) {
    eventBus.setDebug(true);
  }
}
```

## Manual Control

You can manually enable/disable debugging:

```javascript
import { eventBus } from './common/event-bus.js';

// Enable debugging
eventBus.setDebug(true);

// Disable debugging
eventBus.setDebug(false);
```

## Console Output

When debug mode is enabled, you'll see emoji-decorated logs for all EventBus operations:

### Event Emission
```
📤 [EventBus] emit: search { query: "matrix" }
```

### Event Subscription
```
📥 [EventBus] on: search
```

### Event Unsubscription
```
❌ [EventBus] off: search
```

### Successful Event Delivery
```
🔔 [EventBus] delivered: search → [Function]
```

## Common Use Cases

### 1. Tracking Event Flow

Enable debugging to see the complete event lifecycle:

```javascript
// Component A emits event
eventBus.emit(EVENTS.FAVORITE_TOGGLE, { film, isFavorite });
// Console: 📤 [EventBus] emit: favorite-toggle { film: {...}, isFavorite: true }

// Component B receives event
// Console: 🔔 [EventBus] delivered: favorite-toggle → handleFavoriteToggle
```

### 2. Finding Missing Subscriptions

If an event isn't triggering expected behavior:

1. Check console for `📤 emit:` message (event was sent)
2. Look for corresponding `🔔 delivered:` messages
3. If no delivery messages appear, the subscription might be missing or was removed

### 3. Debugging Duplicate Events

If the same handler is called multiple times:

```
📤 [EventBus] emit: search { query: "test" }
🔔 [EventBus] delivered: search → handleSearch
🔔 [EventBus] delivered: search → handleSearch
```

This indicates the handler was subscribed twice. Check for:
- Multiple `subscribe()` calls without proper cleanup
- Component re-initialization without destroying previous instance

### 4. Memory Leak Detection

Look for `📥 on:` without matching `❌ off:` messages. This indicates:
- Subscriptions that weren't cleaned up
- Potential memory leaks

With AbstractView, this is handled automatically:

```javascript
class MyView extends AbstractView {
  constructor(appState) {
    super(appState);
    // Automatically tracked and cleaned up
    this.subscribe(EVENTS.SEARCH, this.handleSearch);
  }
  
  // destroy() automatically calls off() for all subscriptions
}
```

## Troubleshooting

### Events Not Firing

**Symptoms**: No `📤 emit:` messages in console

**Solutions**:
- Verify event name matches constant in `src/common/constants.js`
- Check if the emitting code path is actually executed
- Ensure `eventBus.emit()` is called, not just the handler

### Events Not Received

**Symptoms**: `📤 emit:` appears but no `🔔 delivered:` messages

**Solutions**:
- Verify `subscribe()` was called before `emit()`
- Check event name spelling matches exactly
- Ensure component wasn't destroyed (check for `❌ off:` messages)

### Duplicate Handlers

**Symptoms**: Multiple `🔔 delivered:` messages for single emit

**Solutions**:
- Check if `subscribe()` is called multiple times (e.g., in `render()` instead of `constructor`)
- Verify `destroy()` is called before creating new component instance
- Use AbstractView's `subscribe()` method for automatic cleanup

## Best Practices

1. **Use Constants**: Always use `EVENTS` constants to prevent typos
   ```javascript
   // ✅ Good
   this.subscribe(EVENTS.SEARCH, handler);
   
   // ❌ Bad
   this.subscribe('serch', handler); // typo won't be caught
   ```

2. **Subscribe in Constructor**: Subscribe to events once during initialization
   ```javascript
   constructor(appState) {
     super(appState);
     this.subscribe(EVENTS.SEARCH, this.#handleSearch);
   }
   ```

3. **Use AbstractView**: Leverage automatic cleanup
   ```javascript
   // Automatically cleaned up on destroy()
   this.subscribe(EVENTS.FAVORITE_TOGGLE, this.#handleToggle);
   ```

4. **Check Debug Output**: Regularly review console logs during development

## Performance Notes

Debug logging has minimal performance impact but should be disabled in production:

```javascript
// Production builds should set
eventBus.setDebug(false);
```

The automatic detection handles this for you when deployed to non-localhost domains.
