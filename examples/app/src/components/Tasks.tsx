import { RefObject, useCallback, useMemo, useState } from "react";

import { DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

import { GANTT_SNAP_LEFT_MIN, GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITaskWithDate } from "../types";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";
import { isTaskWithDate } from "../utils/isTaskWithDate";
import { Task } from "./Task";
import { TaskDragOverlay } from "./TaskDragOverlay";

const ERROR_MISSING_DATA = "Drag handler missing required information";

const sesnsorOptions = {
	activationConstraint: {
		distance: 5,
	},
};

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const Tasks: React.FC<Props> = ({ containerRef }) => {
	const [dragOverlayTask, setDragOverlayTask] = useState<ITaskWithDate | null>(null);
	const [initialOffset, setInitialOffset] = useState<number | null>(null);

	const dateStart = useGanttStore.use.ganttDateStart();
	const tasks = useGanttStore.use.tasks();
	const taskUpdateSchedule = useGanttStore.use.taskUpdateSchedule();
	const taskUpdateRank = useGanttStore.use.taskUpdateRank();

	const pointerSensor = useSensor(PointerSensor, sesnsorOptions);

	const sensors = useSensors(pointerSensor);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const task = event.active.data.current;

			if (!isTaskWithDate(task)) {
				throw new Error(ERROR_MISSING_DATA);
			}

			setInitialOffset(getOffsetFromDate(task.start, dateStart));
			setDragOverlayTask(task);
		},
		[dateStart],
	);

	const handleDragMove = useCallback(
		(event: DragMoveEvent) => {
			const task = event.active.data.current;

			if (!isTaskWithDate(task) || !initialOffset) {
				throw new Error(ERROR_MISSING_DATA);
			}

			taskUpdateSchedule(task.id, _calculateOffsetWithTolerance(initialOffset, event));
		},
		[initialOffset, taskUpdateSchedule],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const activeId = event.active?.id.toString();
			const overId = event.over?.id.toString();

			if (activeId && overId) {
				taskUpdateRank(activeId, overId);
			}

			setDragOverlayTask(null);
		},
		[taskUpdateRank],
	);

	const activeIndex = useMemo(() => tasks.findIndex((task) => task.id === dragOverlayTask?.id), [dragOverlayTask?.id, tasks]);

	return (
		<DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} sensors={sensors}>
			<SortableContext items={tasks}>
				{tasks.map((task) => (
					<Task task={task} activeIndex={activeIndex} containerRef={containerRef} key={task.id} />
				))}
			</SortableContext>
			<TaskDragOverlay task={dragOverlayTask} dateStart={dateStart} />
		</DndContext>
	);
};

/**
 * Calculates the drag offset with snapping tolerance based on the initial offset and drag movement event.
 * The function only applies a snap behavior when moving left, as the offset is calculated from the left.
 * This prevents unintended date changes when a task is moved only a few pixels.
 */
const _calculateOffsetWithTolerance = (initialOffset: number, event: DragMoveEvent): number => {
	const currentOffset = initialOffset + event.delta.x;
	const currentDaysFromStart = currentOffset / GRID_WIDTH;

	const remainder = currentDaysFromStart % 1;

	if (event.delta.x < 0) {
		if (remainder <= GANTT_SNAP_LEFT_MIN) {
			return Math.floor(currentDaysFromStart) * GRID_WIDTH;
		}
		return Math.ceil(currentDaysFromStart) * GRID_WIDTH;
	}

	return currentOffset;
};
