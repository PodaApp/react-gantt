import { RefObject } from "react";

import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";

import { ITask, ITaskWithDate } from "../types";
import { NewTask } from "./NewTask";
import "./Task.css";
import { TaskWithDate } from "./TaskWithDate";
import "./TaskWithDate.css";

type Props = {
	task: ITask;
	activeIndex: number;
	containerRef: RefObject<HTMLDivElement>;
};

export const Task = ({ task, activeIndex, containerRef }: Props) => {
	const { over, index, attributes, isDragging, listeners, setNodeRef } = useSortable({ id: task.id, data: task });

	const markerPosition = _calculateMarkerPosition(task.id, over?.id.toString(), index, activeIndex);

	const draggableContainerClassName = classNames({
		"taskWithDate__draggable--dragging": isDragging,
	});

	const draggableMarkerClassName = classNames("taskWithDate__marker", {
		"taskWithDate__marker--after": markerPosition === "after",
		"taskWithDate__marker--before": markerPosition === "before",
	});

	const isOnTimeline = task.start !== null && task.end !== null;
	const isCreating = task.creating;

	const showAddToTimeline = !isOnTimeline && !isCreating;
	return (
		<div className="task" ref={setNodeRef}>
			{showAddToTimeline ? (
				<NewTask taskId={task.id} />
			) : (
				<div {...attributes} {...listeners} className={draggableContainerClassName}>
					<TaskWithDate task={task as ITaskWithDate} activeIndex={activeIndex} containerRef={containerRef} />
				</div>
			)}
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
