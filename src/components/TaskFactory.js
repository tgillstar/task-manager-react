// TaskFactory.js
export class TaskFactory {
  static createTask(title, description, owner, status = "To Do") {
    return {
      id: Date.now(),
      title,
      description,
      owner,
      status,
    };
  }
}
