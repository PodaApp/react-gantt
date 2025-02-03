import { ReactNode, useCallback, useState } from "react";

import { DndContext, DragMoveEvent } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import { COL_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { TaskDraggableHandle } from "./TaskDraggableHandle";

type Props = {
	task: ITask;
	position: { x: number; width: number };
	children: ReactNode;
};

export const TaskDraggable = ({ task, position, children }: Props) => {
	const dateStart = useGanttStore.use.dateStart();
	const setTaskStart = useGanttStore.use.setTaskStart();
	const setTaskEnd = useGanttStore.use.setTaskEnd();

	const [initialPosition, setInitialPosition] = useState<Props["position"] | null>(null);

	const { width, x } = position;

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

			// TODO: use new util method getDateFromOffset
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
			<TaskDraggableHandle taskId={task.id} date={task.start} direction="left" />
			{children}
			<TaskDraggableHandle taskId={task.id} date={task.end} direction="right" />
		</DndContext>
	);
};
