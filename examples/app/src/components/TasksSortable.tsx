import { RefObject, useCallback, useState } from "react";

import {
	DndContext,
	DragEndEvent,
	DragMoveEvent,
	DragStartEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";

import { GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";
import { Task } from "./Task";
import { TaskDragOverlay } from "./TaskDragOverlay";

const activationConstraint = {
	distance: 5,
};

type Props = {
	tasks: ITask[];
	containerRef: RefObject<HTMLDivElement>;
};

export const TasksSortable: React.FC<Props> = ({ tasks, containerRef }) => {
	const dateStart = useGanttStore.use.dateStart();
	const setTaskNewStart = useGanttStore.use.setTaskNewStart();
	const setTasks = useGanttStore.use.setTasks();

	const [activeTask, setActiveTask] = useState<ITask | null>(null);
	const [cachedTaskOffset, setCachedTaskOffset] = useState<number | null>(null);

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint,
	});

	const touchSensor = useSensor(TouchSensor, {
		activationConstraint,
	});

	const keyboardSensor = useSensor(KeyboardSensor, {});

	const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

	const activeIndex = tasks.findIndex((task) => task.id === activeTask?.id);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const task = event.active.data.current as ITask;

			if (!task) {
				throw new Error("Drag handler failed to set task data");
			}
			setCachedTaskOffset(getOffsetFromDate(task.start, dateStart));
			setActiveTask(task);
		},
		[dateStart],
	);

	const handleDragMove = useCallback(
		(event: DragMoveEvent) => {
			const task = event.active.data.current as ITask;

			if (!task) {
				throw new Error("Drag handler failed to set task data");
			}

			if (!cachedTaskOffset) {
				throw new Error("Initial offset was not set");
			}

			const offsetNext = _getSnappedDragOffset(cachedTaskOffset, event);

			const newStart = getDateFromOffset(offsetNext, dateStart);

			setTaskNewStart(task.id, newStart);
		},
		[dateStart, cachedTaskOffset, setTaskNewStart],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const over = event.over;

			if (over) {
				const overIndex = tasks.findIndex((task) => task.id === over?.id);

				if (activeIndex !== overIndex) {
					const newIndex = overIndex;

					// TODO: Move this into a command
					setTasks(arrayMove(tasks, activeIndex, newIndex));
				}
			}

			setActiveTask(null);
		},
		[activeIndex, setTasks, tasks],
	);

	return (
		<DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} sensors={sensors}>
			<SortableContext items={tasks}>
				{tasks.map((task) => (
					<Task task={task} activeIndex={activeIndex} containerRef={containerRef} key={task.id} />
				))}
			</SortableContext>
			<TaskDragOverlay task={activeTask} dateStart={dateStart} />
		</DndContext>
	);
};

const _getSnappedDragOffset = (initialOffset: number, event: DragMoveEvent) => {
	const left = initialOffset + event.delta.x;
	const colIndex = Math.floor(left / GRID_WIDTH);
	const remainder = left % GRID_WIDTH;

	const isMovingLeft = event.delta.x < 0;

	if (isMovingLeft && remainder > GRID_WIDTH / 2) {
		return (colIndex + 1) * GRID_WIDTH;
	} else {
		return colIndex * GRID_WIDTH;
	}
};
