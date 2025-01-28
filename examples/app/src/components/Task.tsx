import { RefObject, useCallback, useRef } from "react";

import classNames from "classnames";
import { differenceInDays } from "date-fns";

import { COL_JUMP_TO_BUFFER_DAYS, COL_WIDTH } from "../constants";
import { GanttStoreState, useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import "./Task.css";
import { TaskOverflow, TaskOverflowDirection, TaskOverflowOnClick } from "./TaskOverflow";

export type TaskOnHover = (taskId: string) => void;

type Props = {
	task: ITask;
	containerRef: RefObject<HTMLDivElement>;
};
// TODO: Move to query
const getPositionForTask = (id: ITask["id"]) => (s: GanttStoreState) => s.tasksPositions[id];
const getIsFocused = (id: ITask["id"]) => (s: GanttStoreState) => s.tasksFocusedId === id;

export const Task = ({ task, containerRef }: Props) => {
	const taskRef = useRef<HTMLDivElement>(null);

	const dateStart = useGanttStore.use.dateStart();
	const stickyPosition = useGanttStore(getPositionForTask(task.id));
	const isTaskFocused = useGanttStore(getIsFocused(task.id));
	const setTaskFocused = useGanttStore.use.setTaskFocused();

	const rangeOffset = differenceInDays(task.start, new Date(dateStart).toISOString()) + 1;
	const rangeLength = differenceInDays(task.end, task.start) + 1;

	const width = rangeLength * COL_WIDTH;
	const x = rangeOffset * COL_WIDTH;

	const handleHover = useCallback(() => setTaskFocused(task.id), [setTaskFocused, task.id]);

	const handleOverflowClick: TaskOverflowOnClick = useCallback(
		(direction) => _scrollToPosition(direction, containerRef.current, taskRef.current),
		[containerRef],
	);

	const taskClass = classNames({
		task: true,
		"task--focused": task.focused,
	});

	const isOverflowLeft = !!stickyPosition?.overflowLeft;
	const isOverflowRight = !!stickyPosition?.overflowRight;
	const isTimelinInViewport = !stickyPosition?.gone;

	const coordinatesStart = stickyPosition ? { x: stickyPosition.left, y: stickyPosition?.top } : null;
	const cordoinantesEnd = stickyPosition ? { x: stickyPosition?.right - 30, y: stickyPosition?.top } : null;

	return (
		<>
			{isOverflowLeft && (
				<TaskOverflow direction="left" position={coordinatesStart} task={task} isInViewport={isTimelinInViewport} onClick={handleOverflowClick} />
			)}
			<div className={taskClass} style={{ width: `${width}px`, transform: `translateX(${x}px)` }} onMouseEnter={handleHover} ref={taskRef}>
				<div className="task__beacon" data-position="start" data-id={task.id} />
				<div className="task__bar" data-id={task.id}></div>
				<div className="task__beacon" data-position="end" data-id={task.id} />

				{!isOverflowLeft && (
					<div className="task__content">
						<div className="task__title">{task.title}</div>
					</div>
				)}
				{isTaskFocused && (
					<div className="task__dependencyHandle">
						<div className="task__dependencyHandle__tag" />
					</div>
				)}
			</div>
			{isOverflowRight && <TaskOverflow direction="right" position={cordoinantesEnd} task={task} onClick={handleOverflowClick} />}
		</>
	);
};

const _scrollToPosition = (direction: TaskOverflowDirection, container: HTMLElement | null, task: HTMLElement | null): void => {
	if (!container || !task) {
		throw new Error("Can't find a required element");
	}

	const containerRect = container.getBoundingClientRect();
	const taskRect = task.getBoundingClientRect();

	const xPosition: { left: number; right: number } = {
		left: taskRect.left - containerRect.left + container.scrollLeft - COL_JUMP_TO_BUFFER_DAYS * COL_WIDTH,
		right: taskRect.right - containerRect.left - containerRect.width + container.scrollLeft + COL_JUMP_TO_BUFFER_DAYS * COL_WIDTH,
	};

	container.scrollTo({
		left: xPosition[direction],
		behavior: "smooth",
	});
};
