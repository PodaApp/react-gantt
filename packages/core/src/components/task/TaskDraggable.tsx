import { ReactNode, useCallback, useState } from "react";

import { DndContext, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import { useTaskPosition } from "../../hooks/useTaskPosition";
import { useGanttStore } from "../../store/ganttStore";
import { ITaskWithDate } from "../../types";
import { TaskDraggableHandle } from "./TaskDraggableHandle";

type Props = {
	task: ITaskWithDate;
	children: ReactNode;
};

const ERROR_MISSING_DATA = "Drag handler missing required information";

export const TaskDraggable = ({ task, children }: Props) => {
	const setTaskStart = useGanttStore((state) => state.setTaskDateStart);
	const setTaskEnd = useGanttStore((state) => state.setTaskDateEnd);
	const setDragActive = useGanttStore((state) => state.setDragActive);

	const { getDateFromOffset, getWidthFromRange } = useTaskPosition();

	const [initialWidth, setInitialWidth] = useState<number>(0);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			event.activatorEvent.preventDefault();
			setDragActive(task);
			setInitialWidth(getWidthFromRange(task.start, task.end));
		},
		[getWidthFromRange, setDragActive, task],
	);

	const handleDragTask = useCallback(
		(event: DragMoveEvent) => {
			event.activatorEvent.preventDefault();

			const activatorEvent = event.activatorEvent as PointerEvent;
			const direction = event.active.data.current?.direction;

			if (!direction) {
				throw new Error(ERROR_MISSING_DATA);
			}

			/**
			 * LayerX is condidered a non standard property and may not behave consistently in all
			 * browsers https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/layerX
			 */
			const deltaX = event.delta.x;

			if (direction === "left") {
				const x = Math.floor(activatorEvent.layerX + deltaX);
				setTaskStart(task.id, getDateFromOffset(x, true));
			} else {
				const x = Math.floor(activatorEvent.layerX + initialWidth + deltaX);
				setTaskEnd(task.id, getDateFromOffset(x));
			}
		},
		[getDateFromOffset, initialWidth, setTaskEnd, setTaskStart, task.id],
	);

	const handleDragEnd = useCallback(() => {
		setDragActive(null);
	}, [setDragActive]);

	return (
		<DndContext
			autoScroll={false}
			onDragStart={handleDragStart}
			onDragMove={handleDragTask}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToHorizontalAxis]}>
			<TaskDraggableHandle taskId={task.id} date={task.start} direction="left" />
			{children}
			<TaskDraggableHandle taskId={task.id} date={task.end} direction="right" />
		</DndContext>
	);
};
