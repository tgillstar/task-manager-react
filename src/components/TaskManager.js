import React, { useState, useEffect } from "react";
import { TaskFactory } from "./TaskFactory";
import { taskObserver } from "./TaskObserver";
import "../styles/TaskManager.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([
    TaskFactory.createTask("Setup React App", "Initialize project", "Alice"),
    TaskFactory.createTask("Design UI", "Create wireframes", "Bob"),
  ]);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    taskObserver.subscribe(setTasks);
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // ✅ Handle Drag Start (Desktop)
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
    setDraggedTaskId(id);
  };

  // ✅ Handle Drop (Desktop)
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId") || draggedTaskId;
    if (!taskId) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id.toString() === taskId ? { ...task, status: newStatus } : task
      )
    );

    setDraggedTaskId(null);
    taskObserver.notify(tasks);
  };

  // ✅ Handle Touch Start (Mobile)
  const handleTouchStart = (e, id) => {
    setDraggedTaskId(id);
  };

  // ✅ Handle Touch Move (Mobile)
  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling while dragging
  };

  // ✅ Handle Touch End (Mobile)
  const handleTouchEnd = (newStatus) => {
    if (!draggedTaskId) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === draggedTaskId ? { ...task, status: newStatus } : task
      )
    );

    setDraggedTaskId(null);
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
          onTouchEnd={() => handleTouchEnd(status)} // Mobile touch handling
        >
          <h3>{status}</h3>
          {tasks
            .filter((task) => task.status === status)
            .map((task) => (
              <div
                key={task.id}
                className="task-card"
                draggable={!isTouchDevice}
                onDragStart={(e) => handleDragStart(e, task.id)}
                onTouchStart={(e) => handleTouchStart(e, task.id)}
                onTouchMove={handleTouchMove}
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
