import { ReactNode, useCallback, useState } from "react";

import { DndContext, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import { useGanttStore } from "../../hooks/useGanttStore";
import { useTaskPosition } from "../../hooks/useTaskPosition";
import { ITaskOffset, ITaskWithDate } from "../../types/tasks";
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

	const [directionActive, setDirectionActive] = useState<"left" | "right" | null>(null);

	const { getTaskPosition } = useTaskPosition();

	const [initialPosition, setTaskPosition] = useState<ITaskOffset | null>(null);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			event.activatorEvent.preventDefault();

			const direction = event.active.data.current?.direction;

			if (!direction) {
				throw new Error(ERROR_MISSING_DATA);
			}

			setDragActive(task);
			setDirectionActive(direction);
			setTaskPosition(getTaskPosition(task.start, task.end, false));
		},
		[getTaskPosition, setDragActive, task],
	);

	const handleDragTask = useCallback(
		(event: DragMoveEvent) => {
			event.activatorEvent.preventDefault();

			const direction = event.active.data.current?.direction;

			if (!direction || !initialPosition) {
				throw new Error(ERROR_MISSING_DATA);
			}

			const offset = initialPosition.x + event.delta.x;

			if (direction === "left") {
				setTaskStart(task.id, offset);
			} else {
				/**
				 * **Important Note: Value of x**
				 * When updating the end position, the offset is calculated by adding the full width of the task to the current offset.
				 * This adjustment aligns the offset with the end date plus one unit.
				 */
				const x = offset + initialPosition.width;
				setTaskEnd(task.id, x);
			}
		},
		[initialPosition, setTaskEnd, setTaskStart, task.id],
	);

	const handleDragEnd = useCallback(() => {
		setDragActive(null);
		setDirectionActive(null);
	}, [setDragActive]);

	return (
		<DndContext
			autoScroll={false}
			onDragStart={handleDragStart}
			onDragMove={handleDragTask}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToHorizontalAxis]}>
			<TaskDraggableHandle taskId={task.id} date={task.start} direction="left" directionActive={directionActive} />
			{children}
			<TaskDraggableHandle taskId={task.id} date={task.end} direction="right" directionActive={directionActive} />
		</DndContext>
	);
};
