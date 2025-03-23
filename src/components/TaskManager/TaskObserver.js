// TaskObserver.js
class TaskObserver {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify(tasks) {
    this.subscribers.forEach((callback) => callback(tasks));
  }
}

export const taskObserver = new TaskObserver();
