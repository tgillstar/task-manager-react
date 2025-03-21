// TaskFactory.js
let nextId = 1;

export const TaskFactory = {
  create: (title, description, status, assignee) => ({
    id: nextId++,
    title,
    description,
    status,
    assignee,
  }),

  // Add a method to manually set the starting ID
  initializeId: (startingId) => {
    if (typeof startingId === "number" && startingId >= nextId) {
      nextId = startingId;
    }
  }
};


