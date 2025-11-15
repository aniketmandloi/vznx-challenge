"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus, Sparkles, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface GeneratedTask {
  name: string;
  order: number;
  estimatedDuration?: string;
  /**
   * Temporary ID for frontend state management
   * Generated on the client side
   */
  _tempId?: string;
}

interface AITaskPreviewProps {
  /**
   * Array of AI-generated tasks
   */
  tasks: GeneratedTask[];
  /**
   * Callback when tasks are modified (edit, add, remove, reorder)
   */
  onTasksChange: (tasks: GeneratedTask[]) => void;
  /**
   * Loading state for async operations
   */
  isLoading?: boolean;
}

/**
 * Sortable Task Item Component
 * Individual draggable task item with edit/delete functionality
 */
function SortableTaskItem({
  task,
  index,
  onEdit,
  onRemove,
}: {
  task: GeneratedTask & { _tempId: string };
  index: number;
  onEdit: (id: string, newName: string) => void;
  onRemove: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(task._tempId, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(task.name);
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group relative flex items-center gap-2 rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Task Order Badge */}
      <Badge variant="secondary" className="shrink-0 text-xs">
        {index + 1}
      </Badge>

      {/* Task Name (Editable) */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="h-8 text-sm"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full text-left text-sm font-medium truncate hover:text-primary transition-colors"
          >
            {task.name}
          </button>
        )}
      </div>

      {/* Estimated Duration (if provided) */}
      {task.estimatedDuration && !isEditing && (
        <Badge variant="outline" className="shrink-0 text-xs">
          {task.estimatedDuration}
        </Badge>
      )}

      {/* Remove Button */}
      {!isEditing && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onRemove(task._tempId)}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}

/**
 * AITaskPreview Component
 *
 * Displays and manages AI-generated tasks with the following features:
 * - Inline editing of task names
 * - Remove individual tasks
 * - Add custom tasks manually
 * - Drag-and-drop reordering
 * - "Accept All" / "Clear All" bulk actions
 * - Smooth animations with Framer Motion
 */
export function AITaskPreview({
  tasks,
  onTasksChange,
  isLoading = false,
}: AITaskPreviewProps) {
  const [newTaskName, setNewTaskName] = useState("");

  // Add temporary IDs for drag-and-drop
  const tasksWithIds = tasks.map((task, index) => ({
    ...task,
    _tempId: task._tempId || `task-${index}-${Date.now()}`,
  }));

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag end event to reorder tasks
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasksWithIds.findIndex((t) => t._tempId === active.id);
      const newIndex = tasksWithIds.findIndex((t) => t._tempId === over.id);

      const reorderedTasks = arrayMove(tasksWithIds, oldIndex, newIndex);

      // Update order property for each task
      const updatedTasks = reorderedTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      onTasksChange(updatedTasks);
    }
  };

  /**
   * Edit task name
   */
  const handleEditTask = (id: string, newName: string) => {
    const updatedTasks = tasksWithIds.map((task) =>
      task._tempId === id ? { ...task, name: newName } : task
    );
    onTasksChange(updatedTasks);
  };

  /**
   * Remove a task
   */
  const handleRemoveTask = (id: string) => {
    const filteredTasks = tasksWithIds
      .filter((task) => task._tempId !== id)
      .map((task, index) => ({ ...task, order: index }));
    onTasksChange(filteredTasks);
  };

  /**
   * Add a new custom task
   */
  const handleAddTask = () => {
    if (newTaskName.trim()) {
      const newTask: GeneratedTask & { _tempId: string } = {
        name: newTaskName.trim(),
        order: tasksWithIds.length,
        _tempId: `custom-task-${Date.now()}`,
      };
      onTasksChange([...tasksWithIds, newTask]);
      setNewTaskName("");
    }
  };

  /**
   * Clear all tasks
   */
  const handleClearAll = () => {
    onTasksChange([]);
  };

  // Empty state
  if (tasksWithIds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="h-10 w-10 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              No tasks generated yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Click "Generate Tasks with AI" to create tasks automatically
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            AI Generated Tasks ({tasksWithIds.length})
          </h3>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleClearAll}
          disabled={isLoading}
          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-1.5 h-3 w-3" />
          Clear All
        </Button>
      </div>

      {/* Instructions */}
      <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <p>
          <strong>Tip:</strong> Click task names to edit, drag to reorder, or
          click X to remove. Add custom tasks below.
        </p>
      </div>

      {/* Sortable Task List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasksWithIds.map((t) => t._tempId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {tasksWithIds.map((task, index) => (
                <SortableTaskItem
                  key={task._tempId}
                  task={task}
                  index={index}
                  onEdit={handleEditTask}
                  onRemove={handleRemoveTask}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Custom Task */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Input
          placeholder="Add a custom task..."
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTask();
            }
          }}
          disabled={isLoading}
          className="h-9 text-sm"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAddTask}
          disabled={!newTaskName.trim() || isLoading}
          className="h-9 shrink-0"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
