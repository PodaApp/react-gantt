import { useCallback, useState } from "react";

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
	// TODO: Move this to zustand, so that when an item is editing the hover actions
	// are not shown
	const [isEditing, setEditing] = useState(false);

	const createTaskAtIndex = useGanttStore.use.createTaskAtIndex();

	const handleSetEditing = useCallback(() => {
		setEditing(true);
	}, []);

	const handleFinishEditing = useCallback(() => {
		setEditing(false);
	}, []);

	const handleAddTask = useCallback(() => {
		createTaskAtIndex(index + 1);
	}, [createTaskAtIndex, index]);

	const taskClassName = classNames("taskTableTask", {
		"taskTableTask--editing": isEditing,
	});

	const showInput = isEditing || (task.creating && !task.end && !task.start);

	return (
		<div className={taskClassName} key={task.id}>
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
			<div className="taskTableTask__actions">
				<button className="taskTableTask__action action" onClick={handleAddTask}>
					<IconPlus />
				</button>
				<button className="taskTableTask__action action">
					<IconGrip />
				</button>
			</div>
		</div>
	);
};
