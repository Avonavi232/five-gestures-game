class EventListener {
    constructor() {
        this.events = {};

        this.emit = this.emit.bind(this);
    }

    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = new Set();
        }
        this.events[event].add(callback);
        return () => this.events[event].delete(callback);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(...args));
        }
    }
}

module.exports = EventListener;