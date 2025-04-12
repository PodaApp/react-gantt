import { useCallback } from "react";

import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";

import { useGanttStore } from "../../hooks/useGanttStore";
import { ITask } from "../../types/tasks";
import { GripVertical } from "../icons/GripVertical";
import { Plus } from "../icons/Plus";
import { TaskTitleInline } from "../task/TaskTitleInline";
import { TaskTableTaskTitle } from "./TaskTableTaskTitle";

import "./TaskTableTask.css";

type Props = {
	task: ITask;
	index: number;
};

export const TaskTableTask = ({ task, index }: Props) => {
	const taskEditingId = useGanttStore((state) => state.taskEditingId);

	const setTaskEditing = useGanttStore((state) => state.setTaskEditing);
	const createTaskAtIndex = useGanttStore((state) => state.taskCreateAtIndex);

	const handleSetEditing = useCallback(() => {
		setTaskEditing(task.id);
	}, [setTaskEditing, task.id]);

	const handleFinishEditing = useCallback(() => {
		setTaskEditing(null);
	}, [setTaskEditing]);

	const handleAddTask = useCallback(() => {
		createTaskAtIndex(index + 1);
	}, [createTaskAtIndex, index]);

	const { active, attributes, listeners, setNodeRef } = useSortable({ id: task.id, data: task });

	// TODO: This caauses all the tasks in the task table to re render. Current this is used
	// to hide the action buttons so that they don't render when a tasks is being created.
	const isEditing = taskEditingId !== null;
	const isEditingSelf = taskEditingId === task.id;

	const taskClassName = classNames("taskTableTask", {
		"taskTableTask--editing": isEditingSelf,
	});

	const showInput = isEditingSelf || (task.creating && !task.end && !task.start);
	const showActions = !active && !isEditing;

	return (
		<div className={taskClassName} ref={setNodeRef}>
			{!showInput && <TaskTableTaskTitle title={task.title} onClick={handleSetEditing} />}
			{showInput && (
				<div className="taskTableTask__textarea">
					<TaskTitleInline id={task.id} title={task.title} onComplete={handleFinishEditing} />
				</div>
			)}
			{showActions && (
				<div className="taskTableTask__actions">
					<button className="taskTableTask__action action" onClick={handleAddTask}>
						<Plus />
					</button>
					<button className="taskTableTask__action action" {...attributes} {...listeners}>
						<GripVertical />
					</button>
				</div>
			)}
		</div>
	);
};
