import React, { useState, useEffect } from "react";
import { TaskFactory } from "./TaskFactory";
import { taskObserver } from "./TaskObserver";
import "../styles/TaskManager.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  //  Load tasks from localStorage or set from uploaded JSON object
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    if (savedTasks.length > 0) {
      setTasks(savedTasks);
  
      //  Set TaskFactory starting ID to avoid collisions
      const maxId = savedTasks.reduce((max, task) => Math.max(max, task.id || 0), 0);
      TaskFactory.initializeId(maxId + 1);
    } else {
      //  Populate the columns with default tasks if none have been uploaded
      const defaultTasks = [
        TaskFactory.create("Initial Task 1", "This is a To Do task.", "To Do", "Alice"),
        TaskFactory.create("Initial Task 2", "This one is already in progress.", "In Progress", "Bob"),
        TaskFactory.create("Initial Task 3", "This task has been completed.", "Done", "Charlie"),
      ];
      setTasks(defaultTasks);
      localStorage.setItem("tasks", JSON.stringify(defaultTasks));
    }
  
    //  Set up the Touch action and observer to watch for any changes to the task status
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  
    taskObserver.subscribe((updatedTasks) => {
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    });
  }, []);  

  //  Update tasks and sync with localStorage and observers
  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("tasks", JSON.stringify(newTasks));
    taskObserver.notify(newTasks);
  };

  //  Handle cursor Drag Start screen action (Desktop)
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task.id);
    setDraggedTask(task);
  };

  //  Handle cursor Drop screen action (Desktop)
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

  //  Handle Touch Start action (Mobile)
  const handleTouchStart = (e, task) => {
    setDraggedTask(task);
  };

  //  Handle Touch Move action (Prevent Scroll While Dragging)
  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  //  Handle Touch End interaction (Mobile Drop action)
  const handleTouchEnd = (newStatus) => {
    if (!draggedTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id === draggedTask.id ? { ...task, status: newStatus } : task
    );

    updateTasks(updatedTasks);
    setDraggedTask(null);
  };

  //  Handle JSON modal form
  const handleJSONSubmit = () => {
    try {
      // Parse the uploaded JSON object from the user
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        // Use TaskFactory to generate complete task objects
        const factoryTasks = parsed.map((taskData) =>
          TaskFactory.create(taskData.title, taskData.description, taskData.status, taskData.assignee)
        );
        updateTasks(factoryTasks);
        setShowModal(false);
        setJsonInput("");
      } else {
        alert("Invalid format: JSON must be an array of task objects.");
      }      
    } catch (err) {
      alert("Invalid JSON: " + err.message);
    }
  };

  return (
    <div className="task-manager">
      {/* Display Upload JSON hyperlink */}
      <div className="task-header">
        <a href="#" onClick={(e) => {
          e.preventDefault(); // prevent anchor tag default behavior
          setShowModal(true);
        }}>
          Upload JSON object
        </a>
      </div>

      {/* Display Task Columns */}
      <div className="task-columns">
        {["To Do", "In Progress", "Done"].map((status) => (
          <div
            key={status}
            className="task-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            onTouchEnd={() => handleTouchEnd(status)}
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

      {/* Display JSON Upload Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Paste Your JSON Array of Tasks</h3>
            <textarea
              rows="10"
              style={{ width: "100%", marginBottom: "10px" }}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"title":"My Task","description":"Details...","status":"To Do","assignee":"Dana"}]'
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={handleJSONSubmit}>Submit JSON object</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );   
};

export default TaskManager;
