import { DragOverlay } from "@dnd-kit/core";

import { ITask } from "../../types/tasks";
import { TaskTableTaskTitle } from "./TaskTableTaskTitle";

import "./TaskTableDragOverlay.css";

type Props = {
	task: ITask | null;
};

export const TaskTableDragOverlay = ({ task }: Props) => {
	const isDragging = task !== null;

	return (
		<DragOverlay className="taskTableDragOverlay" dropAnimation={null}>
			{isDragging ? <TaskTableTaskTitle title={task.title} /> : null}
		</DragOverlay>
	);
};
