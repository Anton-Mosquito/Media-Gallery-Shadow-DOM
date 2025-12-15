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
      console.log(`[EventBus] 📥 Subscribed to "${event}"`, {
        totalListeners: this.events.get(event).size,
      });
    }

    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events.has(event)) return;
    this.events.get(event).delete(callback);

    if (this.debug) {
      console.log(`[EventBus] 📤 Unsubscribed from "${event}"`, {
        remainingListeners: this.events.get(event).size,
      });
    }
  }

  emit(event, detail) {
    if (!this.events.has(event)) return;

    if (this.debug) {
      console.log(`[EventBus] 🔔 Emitting "${event}"`, detail);
    }

    this.events.get(event).forEach((callback) => {
      try {
        callback(detail);
      } catch (error) {
        console.error(`[EventBus] ❌ Error in handler for "${event}":`, error);
      }
    });
  }

  clear() {
    this.events.clear();
  }
}

export const eventBus = new EventBus();

// Auto-enable debug in development
if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  eventBus.setDebug(true);
}

// For browser environments, check if running on localhost
if (
  typeof window !== "undefined" &&
  window.location?.hostname === "localhost"
) {
  eventBus.setDebug(true);
}
