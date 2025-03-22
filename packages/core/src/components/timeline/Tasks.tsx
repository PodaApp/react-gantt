import { RefObject, useCallback, useState } from "react";

import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

import { DRAG_SENSOR_CONFIG } from "../../constants";
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

			setInitialOffset(getX(task.start, { startsAtZero: true }));
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

			const offset = initialOffset + event.delta.x;

			taskUpdateSchedule(task.id, offset);
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
		<DndContext
			autoScroll={false}
			onDragStart={handleDragStart}
			onDragMove={handleDragMove}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			sensors={sensors}>
			<SortableContext items={tasks}>
				{tasks.map((task) => (
					<Task task={task} containerRef={containerRef} key={task.id} />
				))}
			</SortableContext>
			<DragOverlay dropAnimation={null}>{dragging && <TaskDragOverlay task={dragging} />}</DragOverlay>
		</DndContext>
	);
};
