# AI-Powered Smart Task Breakdown - Manual Testing Guide

## Overview

This comprehensive testing guide covers all aspects of the AI task generation feature. Follow each section carefully to ensure the feature works correctly across all scenarios.

---

## Pre-Testing Setup

### 1. Environment Verification

**Required Environment Variables:**

- `OPENAI_API_KEY` - Must be valid and have credits
- `AI_MODEL=gpt-4o-mini` - Or your chosen model

**Verify Setup:**

```bash
# Check if environment variables are set
cat apps/web/.env.local | grep OPENAI

# Start the development server
pnpm run dev
```

**Expected Result:**

- Server starts without errors
- No warnings about missing API keys
- Navigate to http://localhost:3000 successfully

---

## Testing Phase 1: Basic Functionality

### Test 1.1: Generate Tasks for Residential Project

**Steps:**

1. Click "New Project" button
2. Enter project name: "Modern Villa Design"
3. Enter description: "3-bedroom luxury villa with sustainable features and modern architecture"
4. Click "Generate Tasks with AI" button
5. Wait for generation to complete

**Expected Results:**

- ✅ Loading indicator appears during generation
- ✅ Response time is under 5 seconds
- ✅ 8-12 tasks are generated
- ✅ Tasks are relevant to residential architecture (e.g., "Concept sketches", "Site analysis", "Floor plans")
- ✅ Tasks appear in AI preview section
- ✅ All tasks have sequential order numbers
- ✅ Success message appears

**Pass/Fail:** ****\_\_\_****

**Notes:**

---

---

### Test 1.2: Generate Tasks for Commercial Project

**Steps:**

1. Click "New Project" button
2. Enter project name: "Office Building Renovation"
3. Enter description: "5-story commercial office building, LEED certified, downtown location"
4. Click "Generate Tasks with AI" button

**Expected Results:**

- ✅ Tasks are relevant to commercial architecture
- ✅ Tasks differ from residential project (Test 1.1)
- ✅ Mentions commercial-specific items (e.g., "Code compliance", "ADA requirements")

**Pass/Fail:** ****\_\_\_****

**Notes:**

---

---

### Test 1.3: Generate Tasks Without Description

**Steps:**

1. Click "New Project" button
2. Enter project name: "Minimalist House"
3. Leave description empty
4. Click "Generate Tasks with AI" button

**Expected Results:**

- ✅ AI still generates tasks based on project name alone
- ✅ Tasks are generic but relevant to architecture
- ✅ No errors occur

**Pass/Fail:** ****\_\_\_****

**Notes:**

---

---

## Testing Phase 2: UI Interactions

### Test 2.1: Edit Generated Task Names

**Steps:**

1. Generate tasks (use any project)
2. In the AI preview section, click on a task name
3. Edit the task name (e.g., change "Site Analysis" to "Detailed Site Survey")
4. Click outside or press Enter

**Expected Results:**

- ✅ Task name updates immediately
- ✅ Changed task persists in the preview
- ✅ No errors occur

**Pass/Fail:** ****\_\_\_****

---

### Test 2.2: Remove Generated Tasks

**Steps:**

1. Generate tasks
2. Click the "X" or delete button on individual tasks
3. Verify tasks are removed

**Expected Results:**

- ✅ Task is removed from the preview
- ✅ Remaining tasks maintain their order
- ✅ Can remove all tasks
- ✅ Can still submit project with no tasks

**Pass/Fail:** ****\_\_\_****

---

### Test 2.3: Add Custom Tasks to Generated List

**Steps:**

1. Generate tasks
2. Look for "Add Task" or "+" button in preview section
3. Add a custom task (e.g., "Custom Requirement Review")

**Expected Results:**

- ✅ Custom task is added to the list
- ✅ Task appears in correct order
- ✅ Custom task is included when creating project

**Pass/Fail:** ****\_\_\_****

**Note:** If this functionality isn't implemented, mark as N/A

---

### Test 2.4: Reorder Tasks (Drag-and-Drop)

**Steps:**

1. Generate tasks
2. Drag a task from position 5 to position 2
3. Verify order changes

**Expected Results:**

- ✅ Tasks can be reordered via drag-and-drop
- ✅ Order updates visually
- ✅ New order is preserved when creating project

**Pass/Fail:** ****\_\_\_****

**Note:** If this functionality isn't implemented, mark as N/A

---

### Test 2.5: Accept All Tasks

**Steps:**

1. Generate tasks
2. Review the generated tasks
3. Click "Create Project" (without editing)

**Expected Results:**

- ✅ All AI-generated tasks are created
- ✅ Project is created successfully
- ✅ Redirect to project detail page
- ✅ Success toast notification appears
- ✅ All tasks visible in project view

**Pass/Fail:** ****\_\_\_****

---

### Test 2.6: Clear All Tasks

**Steps:**

1. Generate tasks
2. Look for "Clear All" or similar button
3. Click to clear all tasks

**Expected Results:**

- ✅ All tasks are removed from preview
- ✅ Can still create project (without tasks)
- ✅ Or shows message "No tasks generated"

**Pass/Fail:** ****\_\_\_****

**Note:** If this functionality isn't implemented, mark as N/A

---

## Testing Phase 3: Edge Cases

### Test 3.1: Empty Project Name

**Steps:**

1. Click "New Project" button
2. Leave project name empty
3. Try to click "Generate Tasks with AI" button

**Expected Results:**

- ✅ Button is disabled
- ✅ No API call is made
- ✅ Form validation message appears

**Pass/Fail:** ****\_\_\_****

---

### Test 3.2: Very Long Project Description

**Steps:**

1. Click "New Project" button
2. Enter project name: "Large Project"
3. Enter a very long description (2000+ characters)
4. Click "Generate Tasks with AI" button

**Expected Results:**

- ✅ API call succeeds (or shows warning about truncation)
- ✅ Tasks are still generated
- ✅ No errors occur
- ✅ If truncated, user is notified

**Pass/Fail:** ****\_\_\_****

**Notes:**

---

---

### Test 3.3: Special Characters in Input

**Steps:**

1. Click "New Project" button
2. Enter project name with special characters: "Villa & Spa (Phase 1) - €500K"
3. Enter description with quotes and symbols: "Modern design with 'luxury' features"
4. Click "Generate Tasks with AI" button

**Expected Results:**

- ✅ Special characters are handled correctly
- ✅ No errors occur
- ✅ Tasks are generated successfully

**Pass/Fail:** ****\_\_\_****

---

### Test 3.4: Duplicate Task Names

**Steps:**

1. Generate tasks
2. Check if any task names are duplicated

**Expected Results:**

- ✅ AI should avoid duplicate task names
- ✅ If duplicates exist, they should be editable
- ✅ System allows duplicate names (user's responsibility)

**Pass/Fail:** ****\_\_\_****

---

### Test 3.5: Close Dialog During Generation

**Steps:**

1. Click "New Project" button
2. Enter project details
3. Click "Generate Tasks with AI" button
4. **Immediately** close the dialog (X button) while loading

**Expected Results:**

- ✅ Dialog closes
- ✅ API request is cancelled
- ✅ No background errors occur
- ✅ Can reopen dialog and try again

**Pass/Fail:** ****\_\_\_****

---

## Testing Phase 4: Error Handling

### Test 4.1: Invalid API Key

**Steps:**

1. Stop the dev server
2. Set `OPENAI_API_KEY=sk-invalid-key-12345` in `.env.local`
3. Restart dev server
4. Try to generate tasks

**Expected Results:**

- ✅ Error message appears: "AI configuration error. Contact support."
- ✅ No loading state persists indefinitely
- ✅ User can dismiss error
- ✅ Can try manual task creation

**Pass/Fail:** ****\_\_\_****

**Notes:**

---

---

### Test 4.2: Rate Limit Exceeded

**Steps:**

1. Generate tasks 10+ times rapidly (within 1 minute)
2. Observe behavior

**Expected Results:**

- ✅ Error message appears: "Rate limit reached. Please wait X seconds."
- ✅ Retry button appears (optional)
- ✅ Or shows countdown timer
- ✅ User can wait and retry

**Pass/Fail:** ****\_\_\_****

**Notes:**

---

---

### Test 4.3: Network Timeout

**Steps:**

1. Throttle network to simulate slow connection:
   - Chrome DevTools → Network → Throttling → Slow 3G
2. Try to generate tasks

**Expected Results:**

- ✅ Loading indicator shows for extended time
- ✅ Timeout after reasonable duration (30-60 seconds)
- ✅ Error message with retry button
- ✅ Or request eventually succeeds

**Pass/Fail:** ****\_\_\_****

**Notes:**

---

---

### Test 4.4: Invalid AI Response

**Steps:**

1. This requires mocking the AI response to return invalid data
2. (Optional) Temporarily modify `packages/api/src/lib/ai.ts` to return invalid JSON

**Expected Results:**

- ✅ Error is caught gracefully
- ✅ User sees: "Could not generate tasks. Try manually creating them."
- ✅ Form doesn't break
- ✅ Can proceed without AI tasks

**Pass/Fail:** ****\_\_\_****

**Note:** This test is optional and requires code modification

---

### Test 4.5: Network Failure (Offline)

**Steps:**

1. Disconnect from internet (or use Chrome DevTools → Network → Offline)
2. Try to generate tasks

**Expected Results:**

- ✅ Error message appears
- ✅ Retry button available
- ✅ Helpful message: "Network error. Check your connection."

**Pass/Fail:** ****\_\_\_****

---

## Testing Phase 5: Performance

### Test 5.1: Response Time

**Steps:**

1. Generate tasks for 5 different projects
2. Measure time from button click to tasks appearing
3. Record times:
   - Project 1: **\_** seconds
   - Project 2: **\_** seconds
   - Project 3: **\_** seconds
   - Project 4: **\_** seconds
   - Project 5: **\_** seconds

**Expected Results:**

- ✅ Average response time < 3 seconds
- ✅ No response takes longer than 5 seconds
- ✅ Loading indicators work smoothly

**Pass/Fail:** ****\_\_\_****

**Average Time:** ****\_\_\_****

---

### Test 5.2: Concurrent Requests

**Steps:**

1. Open 3 browser tabs
2. In each tab, create a new project and generate tasks simultaneously
3. Observe behavior

**Expected Results:**

- ✅ All requests complete successfully
- ✅ No timeouts occur
- ✅ Each tab gets unique tasks
- ✅ No cross-contamination between tabs

**Pass/Fail:** ****\_\_\_****

---

### Test 5.3: Token Usage Monitoring

**Steps:**

1. Generate tasks for one project
2. Check browser console for any token usage logs (if implemented)
3. Estimate cost per generation

**Expected Results:**

- ✅ Token usage is reasonable (< 1000 total tokens)
- ✅ Estimated cost < $0.01 per generation
- ✅ No excessive API calls

**Pass/Fail:** ****\_\_\_****

**Notes:**

---

---

## Testing Phase 6: Data Integrity

### Test 6.1: Verify Database Records

**Steps:**

1. Generate and create a project with AI tasks
2. Open database studio: `pnpm run db:studio`
3. Navigate to the `task` table
4. Find the newly created tasks

**Expected Results:**

- ✅ All tasks have `ai_generated = true`
- ✅ `metadata` field contains:
  - `generatedAt` timestamp
  - `aiModel` = "gpt-4o-mini"
  - `estimatedDuration` (if provided)
- ✅ `projectId` matches the created project
- ✅ `order` field is set correctly (0, 1, 2, ...)

**Pass/Fail:** ****\_\_\_****

**Screenshot/Evidence:**

---

---

### Test 6.2: Mixed AI and Manual Tasks

**Steps:**

1. Create a project with AI-generated tasks
2. Manually add 2-3 tasks to the project after creation
3. Check database records

**Expected Results:**

- ✅ AI tasks have `ai_generated = true`
- ✅ Manual tasks have `ai_generated = false`
- ✅ All tasks belong to same project
- ✅ Order is maintained correctly

**Pass/Fail:** ****\_\_\_****

---

### Test 6.3: Project Progress Calculation

**Steps:**

1. Create project with 10 AI-generated tasks
2. Mark 5 tasks as complete
3. Check project progress

**Expected Results:**

- ✅ Project progress = 50%
- ✅ Progress updates in real-time
- ✅ Progress bar reflects accurate percentage

**Pass/Fail:** ****\_\_\_****

---

## Testing Phase 7: User Experience

### Test 7.1: Loading States & Animations

**Steps:**

1. Generate tasks
2. Observe animations

**Expected Results:**

- ✅ Smooth loading animation appears
- ✅ "Generating tasks..." message is clear
- ✅ Skeleton loaders or shimmer effects (optional)
- ✅ Tasks appear with stagger animation (optional)
- ✅ No janky or broken animations

**Pass/Fail:** ****\_\_\_****

---

### Test 7.2: Empty State

**Steps:**

1. Open "New Project" dialog
2. Observe initial state (before generating tasks)

**Expected Results:**

- ✅ Clear call-to-action button
- ✅ Helpful hint text (optional)
- ✅ No confusing empty preview section

**Pass/Fail:** ****\_\_\_****

---

### Test 7.3: Success Feedback

**Steps:**

1. Generate tasks
2. Create project with tasks
3. Observe success notifications

**Expected Results:**

- ✅ Toast notification: "Project created with X AI-generated tasks!"
- ✅ Redirect to project detail page
- ✅ Confetti animation (optional)
- ✅ Clear confirmation of action

**Pass/Fail:** ****\_\_\_****

---

### Test 7.4: Accessibility

**Steps:**

1. Navigate using keyboard only (Tab, Enter, Escape)
2. Test with screen reader (optional)

**Expected Results:**

- ✅ All interactive elements are keyboard accessible
- ✅ Focus states are visible
- ✅ Can generate tasks using Enter key
- ✅ Can close dialog using Escape key
- ✅ ARIA labels are present (inspect in DevTools)

**Pass/Fail:** ****\_\_\_****

---

## Testing Phase 8: Regression Tests

### Test 8.1: Manual Project Creation (Without AI)

**Steps:**

1. Click "New Project" button
2. Enter project name and description
3. **Do NOT** click "Generate Tasks with AI"
4. Click "Create Project"
5. Manually add tasks after project creation

**Expected Results:**

- ✅ Project is created without AI tasks
- ✅ Can add tasks manually as before
- ✅ No errors or broken functionality

**Pass/Fail:** ****\_\_\_****

---

### Test 8.2: Edit Existing Project

**Steps:**

1. Create a project (with or without AI tasks)
2. Edit the project name/description
3. Save changes

**Expected Results:**

- ✅ Editing works as before
- ✅ No AI generation button appears in edit mode
- ✅ Existing tasks are preserved

**Pass/Fail:** ****\_\_\_****

---

### Test 8.3: Delete Project

**Steps:**

1. Create a project with AI-generated tasks
2. Delete the project

**Expected Results:**

- ✅ Project is deleted
- ✅ All associated tasks are deleted (cascade delete)
- ✅ No orphaned tasks in database

**Pass/Fail:** ****\_\_\_****

---

## Cross-Browser Testing

### Test 9.1: Chrome

**Browser:** Chrome (latest version)

**Test:** Run Tests 1.1, 2.5, 3.1, 4.1

**Pass/Fail:** ****\_\_\_****

---

### Test 9.2: Firefox

**Browser:** Firefox (latest version)

**Test:** Run Tests 1.1, 2.5, 3.1, 4.1

**Pass/Fail:** ****\_\_\_****

---

### Test 9.3: Safari

**Browser:** Safari (latest version)

**Test:** Run Tests 1.1, 2.5, 3.1, 4.1

**Pass/Fail:** ****\_\_\_****

---

### Test 9.4: Mobile Browser

**Browser:** Mobile Safari or Chrome (iOS/Android)

**Test:** Run Tests 1.1, 2.1, 3.1

**Expected Results:**

- ✅ Responsive design works
- ✅ Touch interactions work
- ✅ No layout issues

**Pass/Fail:** ****\_\_\_****

---

## Security Testing

### Test 10.1: API Key Not Exposed to Client

**Steps:**

1. Open browser DevTools → Network tab
2. Generate tasks
3. Inspect API request

**Expected Results:**

- ✅ API key is NOT visible in request headers
- ✅ API key is NOT in response body
- ✅ All AI calls go through backend/tRPC

**Pass/Fail:** ****\_\_\_****

---

### Test 10.2: Input Sanitization

**Steps:**

1. Enter project name: `<script>alert('XSS')</script>`
2. Generate tasks
3. Create project

**Expected Results:**

- ✅ Script does not execute
- ✅ Input is sanitized or escaped
- ✅ No XSS vulnerabilities

**Pass/Fail:** ****\_\_\_****

---

### Test 10.3: SQL Injection Protection

**Steps:**

1. Enter project name: `'; DROP TABLE task; --`
2. Generate tasks
3. Create project

**Expected Results:**

- ✅ Project is created safely
- ✅ Database tables are NOT affected
- ✅ Input is parameterized (using Drizzle ORM)

**Pass/Fail:** ****\_\_\_****

---

## Final Checklist

Before considering the feature complete, verify:

- [ ] All critical tests pass (Phase 1-4)
- [ ] Performance is acceptable (< 3 seconds average)
- [ ] Error handling works gracefully
- [ ] Database records are correct
- [ ] No regressions in existing features
- [ ] Cross-browser compatibility verified
- [ ] Security tests pass
- [ ] User experience is smooth and intuitive
- [ ] Documentation is updated
- [ ] No console errors during normal usage

---

## Issue Tracking

If any tests fail, document them here:

| Test ID      | Issue Description             | Severity | Status |
| ------------ | ----------------------------- | -------- | ------ |
| Example: 2.4 | Drag-and-drop not implemented | Low      | Open   |
|              |                               |          |        |
|              |                               |          |        |
|              |                               |          |        |

---

## Sign-Off

**Tester Name:** **********\_**********

**Date:** **********\_**********

**Overall Assessment:**

- [ ] Ready for Production
- [ ] Minor Issues (document above)
- [ ] Major Issues - Needs Work

**Notes:**

---

---

---

---

## Appendix: Quick Test Script

For rapid smoke testing, run this quick 5-minute test:

1. **Create Project with AI** (Test 1.1)
2. **Edit a Task** (Test 2.1)
3. **Submit Project** (Test 2.5)
4. **Verify Database** (Test 6.1)
5. **Check No Console Errors**

If all 5 pass, basic functionality is working.

---

**End of Testing Guide**
