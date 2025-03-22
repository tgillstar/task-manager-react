// TaskFactory.js
let nextId = 1;

export const TaskFactory = {
  /**
   * Creates a task object with a unique ID.
   * @param {string} title - Task title
   * @param {string} description - Task description
   * @param {string} status - Task status ("To Do", "In Progress", "Done")
   * @param {string} assignee - Person assigned to the task
   * @returns {object} - New task object
   */
  create: (title, description, status, assignee) => {
    const task = {
      id: nextId++,
      title,
      description,
      status,
      assignee,
    };

    // 🔁 Assignee list management (for autocomplete support)
    try {
      const stored = JSON.parse(localStorage.getItem("assignees")) || [];
      const name = assignee?.trim();

      if (name && !stored.includes(name)) {
        const updated = [...stored, name];
        localStorage.setItem("assignees", JSON.stringify(updated));
      }
    } catch (err) {
      console.warn("Error updating assignees list in localStorage:", err);
    }

    return task;
  },

  /**
   * Initializes the starting ID value to avoid collisions.
   * @param {number} startingId - A number greater than the current nextId
   */
  initializeId: (startingId) => {
    if (typeof startingId === "number" && startingId >= nextId) {
      nextId = startingId;
    }
  },
};