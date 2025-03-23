import React, { useState, useEffect } from "react";
import { TaskFactory } from "./TaskFactory";
import { taskObserver } from "./TaskObserver";
import "./TaskManager.css";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState(() => {
    return JSON.parse(localStorage.getItem("assignees")) || [];
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState(""); // Tracks which column was clicked
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: ""
  });
  const [editingTask, setEditingTask] = useState(null);

  //  Load tasks from localStorage or set from uploaded JSON object
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
  
    if (Array.isArray(savedTasks) && savedTasks.length > 0) {
      setTasks(savedTasks);
  
      // Set TaskFactory starting ID to avoid collisions
      const maxId = savedTasks.reduce((max, task) => Math.max(max, task.id || 0), 0);
      TaskFactory.initializeId(maxId + 1);
    }
  
    // Detect touch devices for drag behavior
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  
    // Subscribe to task updates to sync with localStorage
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

  //  Update localStorage and state when a task is added or edited
  const saveAssignee = (name) => {
    if (!name) return;
    const trimmed = name.trim();
    if (trimmed && !assignees.includes(trimmed)) {
      const updated = [...assignees, trimmed];
      setAssignees(updated);
      localStorage.setItem("assignees", JSON.stringify(updated));
    }
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
  const handleTouchEnd = (e) => {
    if (!draggedTask) return;
  
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
  
    const column = dropTarget?.closest(".task-column");
    const newStatus = column?.querySelector("h3")?.textContent;
  
    if (newStatus && ["Done", "In Progress", "To Do"].includes(newStatus)) {
      const updatedTasks = tasks.map((task) =>
        task.id === draggedTask.id ? { ...task, status: newStatus } : task
      );
  
      updateTasks(updatedTasks);
    }
  
    setDraggedTask(null);
  };

  //  Handle JSON modal form
  const handleJSONSubmit = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      //  Validates that the array of tasks inside the parsed JSON object is formatted as required
      if (!Array.isArray(parsed)) {
        alert(
          "Invalid Task Array format:\n\n" +
          "There have to 2 or more tasks or the array is not formatted as required.\n\n" +
          "Clear off your entry to see the required format presented in the textarea."
        );
        return;
      }
  
      //  Validate each task object has the required fields
      const isValidTask = (t) =>
        t.title?.trim() && t.description?.trim() && t.status?.trim() && t.assignee?.trim();
  
      const allValid = parsed.every(isValidTask);
  
      if (!allValid) {
        alert(
          "One or more tasks are missing required fields.\n\n" +
          "Each task must include: title, description, status, and assignee.\n\n" +
          "Clear off your entry to see the required format presented in the textarea."
        );
        return;
      }
  
      //  Create tasks using TaskFactory
      const factoryTasks = parsed.map((taskData) =>
        TaskFactory.create(
          taskData.title,
          taskData.description,
          taskData.status,
          taskData.assignee
        )
      );

      //  Merge new assignees into localStorage and state
      const uploadedAssignees = parsed
        .map((t) => t.assignee?.trim())
        .filter((name) => !!name && !assignees.includes(name));

      if (uploadedAssignees.length > 0) {
        const updatedAssignees = [...assignees, ...uploadedAssignees];
        setAssignees(updatedAssignees);
        localStorage.setItem("assignees", JSON.stringify(updatedAssignees));
      }

      //  Update tasks and close modal
      const mergedTasks = [...tasks, ...factoryTasks];
      updateTasks(mergedTasks);
      setShowUploadModal(false);
      setJsonInput("");

      } catch (err) {
      alert("Invalid JSON format:\n\n" + 
            "We can't process this JSON object because it's not formatted as required.\n\n" +
            "Clear off your entry to see the required format presented in the textarea."
      );
    }
  };    

   //  Handle Edit Task modal form
  const handleTaskUpdate = (updatedTask) => {
    const updatedTasks = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    updateTasks(updatedTasks);
    setEditingTask(null);
  };
  

  return (
    <div className="task-manager">
      {/* Display Upload JSON hyperlink */}
      <div className="task-header">
        <header className="p-3 bg-light text-white">
          <div className="container-fluid">
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-asterisk text-black" viewBox="0 0 16 16">
              <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1"/>
            </svg>
              <div className="ms-auto text-end">
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={(e) => {
                    e.preventDefault(); // prevent anchor tag default behavior
                    setShowUploadModal(true);
                  }}
                > 
                  Upload JSON Object
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>
      
      {/* Display Intro Message to User If There Are Currently No Tasks */}
      {tasks.length === 0 && (
        <div className="alert alert-info text-center mt-3">
          No tasks yet. Add a task manually or upload a JSON object to get started.
        </div>
      )}

      {/* Display Task Columns */}
      <div className="task-columns">
        {["Done", "In Progress", "To Do"].map((status) => (
          <div
            key={status}
            className="task-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h3>{status}</h3>
            {tasks // Display tasks that have the status of the current column
              .filter((task) => task.status === status)
              .map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  draggable={!isTouchDevice}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onTouchStart={(e) => handleTouchStart(e, task)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd} 
                  onClick={() => setEditingTask(task)} 
                >
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <div className="assignee text-end">
                  <small>assignee: {task.assignee}</small>
                  </div>
                </div>
              ))}
              <button
                className="btn btn-primary"
                onClick={() => {
                  setNewTaskStatus(status);
                  setShowAddTaskModal(true);
                }}
              >
                Add a Task
              </button>

          </div>
        ))}
      </div>

      {/* Display JSON Upload Modal */}
      {showUploadModal && (
        <>
          {/* Bootstrap backdrop */}
          <div className="modal-backdrop fade show"></div>

          {/* Modal container */}
          <div
            className="modal show fade d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content">

                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title">Upload JSON Object</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowUploadModal(false)}
                  ></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="jsonInputArea" className="form-label">
                      Paste your JSON array of tasks
                    </label>
                    <textarea
                      id="jsonInputArea"
                      className="form-control"
                      rows="10"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='[{"title":"My Task","description":"Details...","status":"To Do","assignee":"Dana"}]'
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={handleJSONSubmit}
                  >
                    Submit JSON Object
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}


      {/* Display Add a Task Modal */}
      {showAddTaskModal && (
        <>
          {/* Bootstrap backdrop */}
          <div className="modal-backdrop fade show"></div>

          {/* Modal container with backdrop overlay */}
          <div
            className="modal show fade d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content">

                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title">Add a New Task</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowAddTaskModal(false)}
                  ></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="taskTitle" className="form-label">Title</label>
                    <input
                      id="taskTitle"
                      type="text"
                      className="form-control"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="taskDescription" className="form-label">Description</label>
                    <textarea
                      id="taskDescription"
                      className="form-control"
                      rows="4"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="taskAssignee" className="form-label">Assignee</label>
                    <input
                      type="taskAssignee"
                      className="form-control"
                      list="assignee-options"
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    />
                    <datalist id="assignee-options">
                      {assignees.map((name, index) => (
                        <option key={index} value={name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const createdTask = TaskFactory.create(
                        newTask.title,
                        newTask.description,
                        newTaskStatus,
                        newTask.assignee
                      );
                      updateTasks([...tasks, createdTask]);
                      saveAssignee(newTask.assignee);

                      setShowAddTaskModal(false);
                      setNewTask({ title: "", description: "", assignee: "" });
                    }}
                  >
                    Submit
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddTaskModal(false)}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

      {/* Display Edit Task Modal */}
      {editingTask && (
        <>
          {/* Bootstrap backdrop */}
          <div className="modal-backdrop fade show"></div>

          {/* Bootstrap modal */}
          <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content">

                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title">Edit Task</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setEditingTask(null)}
                  ></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingTask.title}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={editingTask.description}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Assignee</label>
                    <input
                      type="text"
                      className="form-control"
                      list="assignee-options"
                      value={editingTask.assignee}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, assignee: e.target.value })
                      }
                    />
                    <datalist id="assignee-options">
                      {assignees.map((name, index) => (
                        <option key={index} value={name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editingTask.status}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, status: e.target.value })
                      }
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      handleTaskUpdate(editingTask);
                      saveAssignee(editingTask.assignee);  
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditingTask(null)}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );   
};

export default TaskManager;
