import { RefObject, useState } from "react";

import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";

import { COL_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";
import { Task } from "./Task";
import { TaskStatic } from "./TaskStatic";

type Props = {
	tasks: ITask[];
	containerRef: RefObject<HTMLDivElement>;
};

export const TasksSortable: React.FC<Props> = ({ tasks, containerRef }) => {
	const dateStart = useGanttStore.use.dateStart();
	const setTaskNewStart = useGanttStore.use.setTaskNewStart();
	const setTasks = useGanttStore.use.setTasks();

	const [draggingTask, setDraggingTask] = useState<ITask | null>(null);
	const [initialOffset, setInitialOffset] = useState<number | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);

	const activeIndex = tasks.findIndex((task) => task.id === activeId);

	const handleDragStart = (event: DragStartEvent) => {
		const task = event.active.data.current as ITask;

		if (!task) {
			throw new Error("Drag handler failed to set task data");
		}
		setInitialOffset(getOffsetFromDate(task.start, dateStart));
		setActiveId(task.id);
		setDraggingTask(task);
	};

	const handleDragMove = (event: DragMoveEvent) => {
		const task = event.active.data.current as ITask;

		if (!task) {
			throw new Error("Drag handler failed to set task data");
		}

		if (!initialOffset) {
			throw new Error("Initial offset was not set");
		}

		const offsetNext = _getSnappedDragOffset(initialOffset, event);

		const newStart = getDateFromOffset(offsetNext, dateStart);

		setTaskNewStart(task.id, newStart);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const over = event.over;

		if (over) {
			const overIndex = tasks.findIndex((task) => task.id === over?.id);

			if (activeIndex !== overIndex) {
				const newIndex = overIndex;

				// TODO: Move this into a command
				setTasks(arrayMove(tasks, activeIndex, newIndex));
			}
		}

		setDraggingTask(null);
		setActiveId(null);
	};

	return (
		<DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
			<SortableContext items={tasks}>
				{tasks.map((task) => (
					<Task task={task} activeIndex={activeIndex} containerRef={containerRef} key={task.id} />
				))}
			</SortableContext>
			<DragOverlay>{draggingTask ? <TaskStatic task={draggingTask} /> : null}</DragOverlay>
		</DndContext>
	);
};

// TODO: Make this a reusable util
const _getSnappedDragOffset = (initialOffset: number, event: DragMoveEvent) => {
	const left = initialOffset + event.delta.x;
	return Math.ceil(left / COL_WIDTH) * COL_WIDTH;
};
