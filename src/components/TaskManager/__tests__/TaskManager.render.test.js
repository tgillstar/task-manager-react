import React from "react";
import { render, screen } from "@testing-library/react";
import TaskManager from "../TaskManager";

// Utility: mock localStorage for the test environment
const mockTasks = [
  {
    id: "1",
    title: "Test Task",
    description: "Just a test",
    assignee: "Tester",
    status: "To Do"
  }
];

beforeEach(() => {
  localStorage.setItem("tasks", JSON.stringify(mockTasks));
});

afterEach(() => {
  localStorage.clear();
});

test("renders the columns", () => {
  render(<TaskManager />);

  expect(screen.getByText("To Do")).toBeInTheDocument();
  expect(screen.getByText("In Progress")).toBeInTheDocument();
  expect(screen.getByText("Done")).toBeInTheDocument();
});

test("renders initial task from localStorage", () => {
  render(<TaskManager />);

  expect(screen.getByText("Test Task")).toBeInTheDocument();
  expect(screen.getByText("Just a test")).toBeInTheDocument();
  expect(screen.getByText(/assignee: Tester/)).toBeInTheDocument();
});
