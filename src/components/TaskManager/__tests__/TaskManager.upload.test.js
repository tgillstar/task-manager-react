import React from "react";
import { render, screen } from "@testing-library/react";
import TaskManager from "../TaskManager";


// Mocks for window.alert
beforeAll(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });
  
  afterEach(() => {
    localStorage.clear();
    window.alert.mockClear();
  });
  
  test("alerts on invalid JSON format (malformed)", () => {
    render(<TaskManager />);
    fireEvent.click(screen.getByText("Upload JSON object"));
  
    const textarea = screen.getByPlaceholderText(/\[{"title":/);
    fireEvent.change(textarea, {
      target: {
        value: '[{"title": "Incomplete Task", "description": "Missing comma" "status": "To Do"}]'
      }
    });
  
    fireEvent.click(screen.getByText("Submit JSON object"));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Invalid JSON format"));
  });
  
  test("alerts when uploaded data is not an array", () => {
    render(<TaskManager />);
    fireEvent.click(screen.getByText("Upload JSON object"));
  
    const textarea = screen.getByPlaceholderText(/\[{"title":/);
    fireEvent.change(textarea, {
      target: { value: '{"title": "This is not an array"}' }
    });
  
    fireEvent.click(screen.getByText("Submit JSON object"));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Invalid Task Array format"));
  });
  
  test("alerts when task JSON is missing fields", () => {
    render(<TaskManager />);
    fireEvent.click(screen.getByText("Upload JSON object"));
  
    const textarea = screen.getByPlaceholderText(/\[{"title":/);
    fireEvent.change(textarea, {
      target: {
        value: '[{"title": "Missing status", "description": "Oops", "assignee": "Anna"}]'
      }
    });
  
    fireEvent.click(screen.getByText("Submit JSON object"));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Missing required fields"));
  });
  
  test("adds valid task from JSON upload and stores assignee", () => {
    render(<TaskManager />);
    fireEvent.click(screen.getByText("Upload JSON object"));
  
    const textarea = screen.getByPlaceholderText(/\[{"title":/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify([
          {
            title: "New Upload Task",
            description: "From JSON",
            status: "To Do",
            assignee: "Sam"
          }
        ])
      }
    });
  
    fireEvent.click(screen.getByText("Submit JSON object"));
  
    // 🧪 Expect new task to be rendered
    expect(screen.getByText("New Upload Task")).toBeInTheDocument();
    expect(screen.getByText("From JSON")).toBeInTheDocument();
    expect(screen.getByText(/assignee: Sam/i)).toBeInTheDocument();
  
    // 🧪 Check that assignee "Sam" is now stored in localStorage
    const savedAssignees = JSON.parse(localStorage.getItem("assignees"));
    expect(savedAssignees).toContain("Sam");
  });