import React, { useState, useEffect } from "react";
import { TaskFactory } from "./TaskFactory";
import { taskObserver } from "./TaskObserver";
import "../styles/TaskManager.css"; // Import styles

const TaskManager = () => {
  const [tasks, setTasks] = useState([
    TaskFactory.createTask("Setup React App", "Initialize project", "Alice"),
    TaskFactory.createTask("Design UI", "Create wireframes", "Bob"),
  ]);

  useEffect(() => {
    taskObserver.subscribe(setTasks);
  }, []);

  // Handle Drag Start
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  // Handle Drop to Update Task Status
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id.toString() === taskId ? { ...task, status: newStatus } : task
      )
    );

    taskObserver.notify(tasks);
  };

  return (
    <div className="task-manager">
      {["To Do", "In Progress", "Done"].map((status) => (
        <div
          key={status}
          className="task-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, status)}
        >
          <h3>{status}</h3>
          {tasks
            .filter((task) => task.status === status)
            .map((task) => (
              <div
                key={task.id}
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
              >
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <small>Owner: {task.owner}</small>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default TaskManager;