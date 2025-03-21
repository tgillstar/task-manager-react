import React, { useState, useEffect } from "react";
import { TaskFactory } from "./TaskFactory";
import { taskObserver } from "./TaskObserver";
import "../styles/TaskManager.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // 🏆 Load tasks from localStorage when the page loads
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
  
    if (savedTasks && savedTasks.length > 0) {
      setTasks(savedTasks);
    } else {
      // If no tasks exist in localStorage, create default tasks
      const defaultTasks = [
        {
          id: 1,
          title: "Initial Task 1",
          description: "This is a To Do task.",
          status: "To Do",
          assignee: "Alice"
        },
        {
          id: 2,
          title: "Initial Task 2",
          description: "This one is already in progress.",
          status: "In Progress",
          assignee: "Bob"
        },
        {
          id: 3,
          title: "Initial Task 3",
          description: "This task has been completed.",
          status: "Done",
          assignee: "Charlie"
        }
      ];
  
      setTasks(defaultTasks);
      localStorage.setItem("tasks", JSON.stringify(defaultTasks));
    }
  
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  
    taskObserver.subscribe((updatedTasks) => {
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    });
  }, []);  

  // 🏆 Function to update tasks
  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("tasks", JSON.stringify(newTasks));
    taskObserver.notify(newTasks);
  };

  // 🏆 Handle Drag Start (Desktop)
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task.id);
    setDraggedTask(task);
  };

  // 🏆 Handle Drop (Desktop)
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");

    if (!taskId && !draggedTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id.toString() === (taskId || draggedTask.id)
        ? { ...task, status: newStatus }
        : task
    );

    updateTasks(updatedTasks);
    setDraggedTask(null);
  };

  // 🏆 Handle Touch Start (Mobile)
  const handleTouchStart = (e, task) => {
    setDraggedTask(task);
  };

  // 🏆 Handle Touch Move (Prevent Scroll While Dragging)
  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  // 🏆 Handle Touch End (Mobile Drop Action)
  const handleTouchEnd = (newStatus) => {
    if (!draggedTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id === draggedTask.id ? { ...task, status: newStatus } : task
    );

    updateTasks(updatedTasks);
    setDraggedTask(null);
  };

  return (
    <div className="task-manager">
      {["To Do", "In Progress", "Done"].map((status) => (
        <div
          key={status}
          className="task-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, status)}
          onTouchEnd={() => handleTouchEnd(status)} // Mobile support
        >
          <h3>{status}</h3>
          {tasks
            .filter((task) => task.status === status)
            .map((task) => (
              <div
                key={task.id}
                className="task-card"
                draggable={!isTouchDevice}
                onDragStart={(e) => handleDragStart(e, task)}
                onTouchStart={(e) => handleTouchStart(e, task)}
                onTouchMove={handleTouchMove}
              >
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <small>assignee: {task.assignee}</small>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default TaskManager;
