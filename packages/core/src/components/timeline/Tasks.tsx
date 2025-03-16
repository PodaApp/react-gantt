import { RefObject, useCallback, useState } from "react";

import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

import { DRAG_SENSOR_CONFIG, GANTT_SNAP_LEFT_MIN, GRID_WIDTH } from "../../constants";
import { useGanttStore } from "../../hooks/useGanttStore";
import { useTaskPosition } from "../../hooks/useTaskPosition";
import { isTaskWithDate } from "../../utils/isTaskWithDate";
import { Task } from "../task/Task";
import { TaskDragOverlay } from "../task/TaskDragOverlay";

const ERROR_MISSING_DATA = "Drag handler missing required information";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const Tasks: React.FC<Props> = ({ containerRef }) => {
	const [initialOffset, setInitialOffset] = useState<number | null>(null);

	const { getX } = useTaskPosition();

	const tasks = useGanttStore((state) => state.tasks);
	const dragging = useGanttStore((state) => state.draggingTask);
	const setDragActive = useGanttStore((state) => state.setDragActive);
	const setDragOverId = useGanttStore((state) => state.setDragOverId);
	const taskUpdateSchedule = useGanttStore((state) => state.taskUpdateSchedule);
	const taskUpdateRank = useGanttStore((state) => state.taskUpdateRank);

	const pointerSensor = useSensor(PointerSensor, DRAG_SENSOR_CONFIG);
	const sensors = useSensors(pointerSensor);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const task = event.active.data.current;

			if (!isTaskWithDate(task)) {
				throw new Error(ERROR_MISSING_DATA);
			}

			setInitialOffset(getX(task.start, false));
			setDragActive(task);
		},
		[getX, setDragActive],
	);

	const handleDragMove = useCallback(
		(event: DragMoveEvent) => {
			const task = event.active.data.current;

			if (!isTaskWithDate(task) || initialOffset === null) {
				throw new Error(ERROR_MISSING_DATA);
			}

			taskUpdateSchedule(task.id, _calculateOffsetWithTolerance(initialOffset, event));
		},
		[initialOffset, taskUpdateSchedule],
	);

	const handleDragOver = useCallback(
		(event: DragMoveEvent) => {
			const overId = event.over?.id.toString();
			setDragOverId(overId || null);
		},
		[setDragOverId],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const activeId = event.active?.id.toString();
			const overId = event.over?.id.toString();

			if (activeId && overId) {
				taskUpdateRank(activeId, overId);
			}

			setDragActive(null);
		},
		[setDragActive, taskUpdateRank],
	);

	return (
		<DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragOver={handleDragOver} onDragEnd={handleDragEnd} sensors={sensors}>
			<SortableContext items={tasks}>
				{tasks.map((task) => (
					<Task task={task} containerRef={containerRef} key={task.id} />
				))}
			</SortableContext>
			<DragOverlay dropAnimation={null}>{dragging && <TaskDragOverlay task={dragging} />}</DragOverlay>
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
