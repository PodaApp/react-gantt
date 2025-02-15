import { ReactNode, useCallback, useState } from "react";

import { DndContext, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import { useGanttStore } from "../store/ganttStore";
import { ITaskWithDate } from "../types";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { getRangeWidth } from "../utils/getRangeWidth";
import { TaskDraggableHandle } from "./TaskDraggableHandle";

type Props = {
	task: ITaskWithDate;
	children: ReactNode;
};

const ERROR_MISSING_DATA = "Drag handler missing required information";

export const TaskDraggable = ({ task, children }: Props) => {
	const dateStart = useGanttStore.use.ganttDateStart();
	const setTaskStart = useGanttStore.use.setTaskDateStart();
	const setTaskEnd = useGanttStore.use.setTaskDateEnd();

	const [initialWidth, setInitialWidth] = useState<number>(0);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			event.activatorEvent.preventDefault();
			setInitialWidth(getRangeWidth(task.start, task.end));
		},
		[task],
	);

	const handleDragTask = useCallback(
		(event: DragMoveEvent) => {
			const activatorEvent = event.activatorEvent as PointerEvent;
			activatorEvent.preventDefault();
			const direction = event.active.data.current?.direction;

			if (!direction) {
				throw new Error(ERROR_MISSING_DATA);
			}

			/**
			 * LayerX is condidered a non standard property and may not behave consistently in all
			 * browsers https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/layerX
			 */

			if (direction === "left") {
				const x = activatorEvent.layerX + event.delta.x;
				setTaskStart(task.id, getDateFromOffset(x, dateStart));
			} else {
				const x = activatorEvent.layerX + initialWidth + event.delta.x;
				setTaskEnd(task.id, getDateFromOffset(x, dateStart));
			}
		},
		[dateStart, initialWidth, setTaskEnd, setTaskStart, task.id],
	);

	return (
		<DndContext onDragStart={handleDragStart} onDragMove={handleDragTask} modifiers={[restrictToHorizontalAxis]}>
			<TaskDraggableHandle taskId={task.id} date={task.start} direction="left" />
			{children}
			<TaskDraggableHandle taskId={task.id} date={task.end} direction="right" />
		</DndContext>
	);
};
