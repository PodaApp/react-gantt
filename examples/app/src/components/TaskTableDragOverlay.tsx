import { DragOverlay } from "@dnd-kit/core";

import { ITask } from "../types";
import "./TaskTableDragOverlay.css";
import { TaskTableTaskTitle } from "./TaskTableTaskTitle";

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
