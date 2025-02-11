import { useCallback } from "react";

import classNames from "classnames";

import IconGrip from "../assets/grip-vertical.svg?react";
import IconPlus from "../assets/plus.svg?react";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import "./TaskTableTask.css";
import { TaskTitleInline } from "./TaskTitleInline";

type Props = {
	task: ITask;
	index: number;
};

export const TaskTableTask = ({ task, index }: Props) => {
	const taskEditingId = useGanttStore.use.taskEditingId();

	const setTaskEditing = useGanttStore.use.setTaskEditing();
	const createTaskAtIndex = useGanttStore.use.createTaskAtIndex();

	const handleSetEditing = useCallback(() => {
		setTaskEditing(task.id);
	}, [setTaskEditing, task.id]);

	const handleFinishEditing = useCallback(() => {
		setTaskEditing(null);
	}, [setTaskEditing]);

	const handleAddTask = useCallback(() => {
		createTaskAtIndex(index + 1);
	}, [createTaskAtIndex, index]);

	// TODO: This caauses all the tasks in the task table to re render. Current this is used
	// to hide the action buttons so that they don't render when a tasks is being created.
	const isEditing = taskEditingId !== null;
	const isEditingSelf = taskEditingId === task.id;

	const taskClassName = classNames("taskTableTask", {
		"taskTableTask--editing": isEditingSelf,
	});

	const showInput = isEditingSelf || (task.creating && !task.end && !task.start);

	return (
		<div className={taskClassName}>
			{!showInput && (
				<div className="taskTableTask__title" onClick={handleSetEditing}>
					<span>{task.title}</span>
				</div>
			)}
			{showInput && (
				<div className="taskTableTask__textarea">
					<TaskTitleInline id={task.id} title={task.title} onComplete={handleFinishEditing} />
				</div>
			)}
			{!isEditing && (
				<div className="taskTableTask__actions">
					<button className="taskTableTask__action action" onClick={handleAddTask}>
						<IconPlus />
					</button>
					<button className="taskTableTask__action action">
						<IconGrip />
					</button>
				</div>
			)}
		</div>
	);
};
