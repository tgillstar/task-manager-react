// TaskFactory.js
export class TaskFactory {
  static createTask(title, description, owner, status = "To Do") {
    return {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Adds randomness
      title,
      description,
      owner,
      status,
    };
  }
}
