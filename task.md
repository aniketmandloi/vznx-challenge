# Objective

Welcome to the VZNX Technical Challenge.

Your task is to build a small, functional prototype inspired by our upcoming platform — a workspace designed to simplify how architecture studios manage their projects and teams.

This mini challenge is your opportunity to show how you approach structure, simplicity, and clarity in your code. Keep it minimal, logical, and easy to understand.

## Core Requirements

### 1. Project Dashboard

Build a clean dashboard that displays a list of projects with:

- Project Name
- Status (e.g., "In Progress," "Completed")
- Progress Bar (% complete)

You should be able to:

- Add a new project
- Edit a project's progress (manual update is fine)
- Delete a project

**Bonus:** Automatically update the project progress when all related tasks are marked complete.

### 2. Task List (Inside Each Project)

When a user clicks on a project, display its task list.

Each task should include:

- Task name
- Status toggle (Incomplete / Complete)

When marked complete:

- The task should visibly update (e.g., strikethrough or green check).
- (Optional) Automatically update the parent project's progress bar.

### 3. Team Overview

Create a basic team overview page showing:

- Team member name
- How many tasks are assigned to them
- (Optional) A simple "capacity bar" — e.g., 5 tasks = 100% capacity

**Bonus:** Use colour logic (green/orange/red) to show workload levels.

## Technical Notes

Use any tech stack you prefer — React / Node.js (or similar).

A lightweight backend is encouraged. You can use local storage, static data, or a simple backend setup (e.g. Node.js with Express, Firebase, or a mock API).

Focus on structure, clarity, and logic — not on how big the build is. The goal is to see how you think, structure data flow, and write clean, maintainable code across the stack.

## Design

You're not being tested on design, but UI matters.

Keep it:

- Clean and readable
- Organised into clear sections (Projects → Tasks → Team)
- Consistent with simple visual cues for status and hierarchy
