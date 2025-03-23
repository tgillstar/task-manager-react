#  Task Manager React App

A modern and responsive task management application built with **React** and styled using **Bootstrap 5**, mimicking Trello-style functionality. This app supports:

-  Drag-and-drop (desktop) and touch-drag (mobile) for moving tasks across status columns  
-  Manual task creation and editing via Bootstrap modal forms  
-  Uploading a JSON object of tasks  
-  Persistent state with `localStorage`  
-  Extendable design using `TaskFactory` and `taskObserver` for ID generation and state synchronization  

---

##  Features

###  Task Status Columns
- "To Do", "In Progress", and "Done" columns
- Drag and drop tasks between columns (desktop)
- Touch support for mobile task movement

###  Add a Task
- "Add a Task" button at the bottom of each column
- Opens a modal form prefilled with status
- Enter a new Assignee name or use autocomplete to fill in Assignee name from existing Assignee list
- New task is assigned an auto-generated ID

###  Edit a Task
- Click any task card to open an edit modal
- Update title, description, and status
- Enter a new Assignee name or use autocomplete to change Assignee from existing Assignee list

###  Upload JSON Object
- Upload task data via a JSON textarea modal
- Automatically generates unique task IDs via `TaskFactory`

###  LocalStorage Integration
- Tasks are saved to browser localStorage
- Persisted across sessions
- Synced with internal observer via `taskObserver`

---

##  Technologies Used

- **React 19**
- **Bootstrap 5**
- **JavaScript (ES6+)**
- **LocalStorage**
- Custom utility modules:
  - `TaskFactory.js` – handles unique ID generation
  - `taskObserver.js` – basic pub/sub for task syncing

---

##  Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/starrry/task-manager-react.git
cd task-manager-react
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App

```bash
npm start
```

App will be live at [http://localhost:3000](http://localhost:3000)

### 4. Run Tests (if applicable)

```bash
npm test
```

### 5. Build for Production

```bash
npm run build
```

The production-ready build will be generated in the `build/` folder.

---

##  JSON Upload Format

To upload a task list via the "Upload JSON Object" modal, use the following format:

```json
[
  {
    "title": "Example Task",
    "description": "Write documentation",
    "status": "To Do",
    "assignee": "Sam"
  }
]
```

 *Task IDs are automatically added using the `TaskFactory`.*

---

##  Development Notes

- All tasks are managed through the central `tasks` state
- `updateTasks()` handles syncing to localStorage and notifying observers
- `TaskFactory` ensures all tasks have unique IDs regardless of how they're created
- Bootstrap 5 is used for modal styling, layout, and form controls
- The app is mobile-responsive and supports touch gestures for drag-and-drop

---

##  Future Enhancements

- [x] Edit and update tasks
- [x] Save Assignee list for autocomplete functionality
- [x] Upload tasks via JSON
- [x] Mobile drag/drop support
- [ ] Add delete (or archive) task functionality
- [ ] Filter/sort tasks
- [ ] Add due date
- [ ] Customize status columns