/**
 * Observable (Subject) - Observer Pattern
 * Any class that extends Observable can notify registered observers of events.
 */
class Observable {
  constructor() {
    this._observers = [];
  }

  /**
   * Register an observer
   * @param {Object} observer - Must implement an update(eventType, data) method
   */
  addObserver(observer) {
    if (typeof observer.update !== 'function') {
      throw new Error('Observer must implement an update() method.');
    }
    this._observers.push(observer);
  }

  removeObserver(observer) {
    this._observers = this._observers.filter(obs => obs !== observer);
  }

  /**
   * Notify all registered observers
   * @param {string} eventType - e.g. 'TOPIC_ACCESSED', 'MESSAGE_POSTED'
   * @param {*} data - Event payload
   */
  notify(eventType, data) {
    this._observers.forEach(observer => observer.update(eventType, data));
  }
}

module.exports = Observable;
