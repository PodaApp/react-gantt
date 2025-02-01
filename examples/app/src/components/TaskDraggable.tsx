import { useCallback, useState } from "react";

import { DndContext, DragMoveEvent } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { differenceInDays } from "date-fns";

import { COL_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { Task, TaskProps } from "./Task";
import "./TaskDraggable.css";
import { TaskDraggableHandle } from "./TaskDraggableHandle";

type Props = TaskProps & {};
type TaskPosition = { x: number; width: number };

export const TaskDraggable: React.FC<Props> = ({ task, containerRef }) => {
	const dateStart = useGanttStore.use.dateStart();
	const setTaskStart = useGanttStore.use.setTaskStart();
	const setTaskEnd = useGanttStore.use.setTaskEnd();

	const [initialPosition, setInitialPosition] = useState<TaskPosition | null>(null);

	const { width, x } = _calculateTaskPosition(dateStart, task);

	const handleDragStart = useCallback(() => {
		setInitialPosition({ width, x });
	}, [width, x]);

	const handleDragTask = useCallback(
		(event: DragMoveEvent) => {
			const direction = event.active.data.current?.direction;

			if (!direction) {
				throw new Error("TaskDraggableHandle missing direction data");
			}

			if (!initialPosition) {
				throw new Error("TaskDraggableHandle missing cached position");
			}

			// Calculate the left position of the element relative to the container
			const relativeLeft = initialPosition.x + event.delta.x;
			const draggedPosition = Math.ceil(relativeLeft / COL_WIDTH) * COL_WIDTH;
			const delta = direction === "left" ? initialPosition.x - draggedPosition : draggedPosition - initialPosition.x;

			const leftEdge = initialPosition.x - delta;
			const edgeRight = initialPosition.x + initialPosition.width + delta - COL_WIDTH;

			const start = getDateFromOffset(leftEdge, dateStart);
			const end = getDateFromOffset(edgeRight, dateStart);

			if (direction === "left") {
				setTaskStart(task.id, start);
				return;
			}

			setTaskEnd(task.id, end);
		},
		[dateStart, initialPosition, setTaskEnd, setTaskStart, task.id],
	);

	return (
		<DndContext onDragStart={handleDragStart} onDragMove={handleDragTask} modifiers={[restrictToHorizontalAxis]}>
			<div className="taskDraggable" style={{ width: `${width}px`, transform: `translateX(${x}px)` }}>
				<Task task={task} containerRef={containerRef} />
				<TaskDraggableHandle taskId={task.id} date={task.start} direction="left" />
				<TaskDraggableHandle taskId={task.id} date={task.end} direction="right" />
			</div>
		</DndContext>
	);
};

const _calculateTaskPosition = (ganttStart: number, task: ITask): { width: number; x: number } => {
	const rangeOffset = differenceInDays(task.start, new Date(ganttStart).toISOString()) + 1;
	const rangeLength = differenceInDays(task.end, task.start) + 1;

	return { width: rangeLength * COL_WIDTH, x: rangeOffset * COL_WIDTH };
};
