import { RefObject } from "react";

import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";

import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { getTaskPosition } from "../utils/getTaskPosition";
import "./Task.css";
import { TaskContent } from "./TaskContent";
import { TaskDraggable } from "./TaskDraggable";

type Props = {
	task: ITask;
	activeIndex: number;
	containerRef: RefObject<HTMLDivElement>;
};

export const Task = ({ task, activeIndex, containerRef }: Props) => {
	const dateStart = useGanttStore.use.dateStart();

	const { over, index, attributes, isDragging, listeners, setNodeRef } = useSortable({ id: task.id, data: task });

	const taskPosition = getTaskPosition(dateStart, task);
	const markerPosition = _calculateMarkerPosition(task.id, over?.id.toString(), index, activeIndex);

	const draggableContainerClassName = classNames({
		"task__draggable--dragging": isDragging,
	});

	const draggableMarkerClassName = classNames("task__marker", {
		"task__marker--after": markerPosition === "after",
		"task__marker--before": markerPosition === "before",
	});

	const taskbarInlinePosition = {
		"--task-width": `${taskPosition.width}px`,
		"--task-x": `${taskPosition.x}px`,
	} as React.CSSProperties;

	return (
		<div className="task" ref={setNodeRef}>
			<div className="task__bar" style={taskbarInlinePosition}>
				<div {...attributes} {...listeners} className={draggableContainerClassName}>
					<TaskDraggable task={task} position={taskPosition}>
						<TaskContent task={task} containerRef={containerRef} />
					</TaskDraggable>
				</div>
			</div>
			<div className={draggableMarkerClassName} />
		</div>
	);
};

const _calculateMarkerPosition = (taskId: string, overId: string | undefined, currentIndex: number, activeIndex: number) => {
	if (taskId !== overId || !overId || currentIndex === activeIndex) {
		return undefined;
	}

	return currentIndex > activeIndex ? "after" : "before";
};
