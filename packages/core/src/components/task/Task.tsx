import { MouseEvent, RefObject, useCallback } from "react";

import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";

import { useGanttStore } from "../../hooks/useGanttStore";
import { useTrackTaskPositions } from "../../hooks/useTrackTaskPositions";
import { ITask } from "../../types";
import { isTaskWithDate } from "../../utils/isTaskWithDate";
import { TaskWithDate } from "./TaskWithDate";
import { TaskWithoutDate } from "./TaskWithoutDate";

import "./Task.css";

type Props = {
	task: ITask;
	containerRef: RefObject<HTMLDivElement>;
};

export const Task = ({ task, containerRef }: Props) => {
	useTrackTaskPositions(containerRef);

	const draggingIndex = useGanttStore((state) => state.draggingActiveIndex);
	const overId = useGanttStore((state) => state.draggingOverId);

	const { index, attributes, isDragging, listeners, setNodeRef } = useSortable({ id: task.id, data: task });

	const markerPosition = _calculateMarkerPosition(task.id, index, overId, draggingIndex);

	const draggableContainerClassName = classNames({
		"taskWithDate__draggable--dragging": isDragging,
	});

	const draggableMarkerClassName = classNames("taskWithDate__marker", {
		"taskWithDate__marker--after": markerPosition === "after",
		"taskWithDate__marker--before": markerPosition === "before",
	});

	const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
		event?.stopPropagation();
	}, []);

	return (
		<div className="task" onClick={handleClick} ref={setNodeRef}>
			{!isTaskWithDate(task) ? (
				<TaskWithoutDate task={task} />
			) : (
				<div {...attributes} {...listeners} className={draggableContainerClassName}>
					<TaskWithDate task={task} activeIndex={draggingIndex} containerRef={containerRef} />
				</div>
			)}
			<div className={draggableMarkerClassName} />
		</div>
	);
};

const _calculateMarkerPosition = (currentId: string, currentIndex: number, overId: string | null, activeIndex: number | null) => {
	if (activeIndex === null || currentId !== overId || overId === null || currentIndex === activeIndex) {
		return "";
	}

	return currentIndex > activeIndex ? "after" : "before";
};
