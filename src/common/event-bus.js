// src/common/event-bus.js
class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events.has(event)) return;
    this.events.get(event).delete(callback);
  }

  emit(event, detail) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach((callback) => {
      try {
        callback(detail);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  clear() {
    this.events.clear();
  }
}

export const eventBus = new EventBus();
