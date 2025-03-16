import { useCallback } from "react";

import { DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

import { DRAG_SENSOR_CONFIG } from "../../constants";
import { useGanttStore } from "../../hooks/useGanttStore";
import { ITask } from "../../types";
import { TaskTableDragOverlay } from "./TaskTableDragOverlay";
import { TaskTableTask } from "./TaskTableTask";

export const TaskTableTasks = () => {
	const tasks = useGanttStore((state) => state.tasks);
	const dragging = useGanttStore((state) => state.draggingTask);
	const setDragActive = useGanttStore((state) => state.setDragActive);
	const setDragOverId = useGanttStore((state) => state.setDragOverId);
	const taskUpdateRank = useGanttStore((state) => state.taskUpdateRank);

	const pointerSensor = useSensor(PointerSensor, DRAG_SENSOR_CONFIG);
	const sensors = useSensors(pointerSensor);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const task = event.active.data.current as ITask;
			setDragActive(task);
		},
		[setDragActive],
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
		<DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} sensors={sensors}>
			<SortableContext items={tasks}>
				{tasks.map((task, index) => (
					<TaskTableTask task={task} index={index} key={task.id} />
				))}
			</SortableContext>
			<TaskTableDragOverlay task={dragging} />
		</DndContext>
	);
};
