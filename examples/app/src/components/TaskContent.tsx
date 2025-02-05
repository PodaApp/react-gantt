import { RefObject, useCallback, useRef } from "react";

import classNames from "classnames";
import { createPortal } from "react-dom";

import { GANTT_JUMP_TO_TASK_PADDING_DAYS, GRID_WIDTH } from "../constants";
import { GanttStoreState, useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import "./TaskContent.css";
import { TaskOverflow, TaskOverflowDirection, TaskOverflowOnClick } from "./TaskOverflow";
import { TaskStatic } from "./TaskStatic";
import { TaskTitleInline } from "./TaskTitleInline";

export type TaskOnHover = (taskId: string) => void;

export type TaskProps = {
	task: ITask;
	containerRef: RefObject<HTMLDivElement>;
};

// TODO: Move to querys
const getPositionForTask = (id: ITask["id"]) => (s: GanttStoreState) => s.tasksPositions[id];
const getIsFocused = (id: ITask["id"]) => (s: GanttStoreState) => s.tasksFocusedId === id;

export const TaskContent = ({ task, containerRef }: TaskProps) => {
	const taskRef = useRef<HTMLDivElement>(null);

	const stickyPosition = useGanttStore(getPositionForTask(task.id));
	const isTaskFocused = useGanttStore(getIsFocused(task.id));
	const setTaskFocused = useGanttStore.use.setTaskFocused();

	const handleHover = useCallback(() => setTaskFocused(task), [setTaskFocused, task]);

	const handleOverflowClick: TaskOverflowOnClick = useCallback(
		(direction) => _scrollToPosition(direction, containerRef.current, taskRef.current),
		[containerRef],
	);

	const taskClass = classNames({
		taskContent: true,
		"taskContent--focused": isTaskFocused,
	});

	const isOverflowLeft = !!stickyPosition?.overflowLeft;
	const isOverflowRight = !!stickyPosition?.overflowRight;
	const isTimelinInViewport = !stickyPosition?.gone;

	const coordinatesStart = stickyPosition ? { x: stickyPosition.left, y: stickyPosition?.top } : null;
	const cordoinantesEnd = stickyPosition ? { x: stickyPosition?.right - 30, y: stickyPosition?.top } : null;

	if (!containerRef.current) {
		return null;
	}

	const showTitleStatic = !isOverflowLeft && !task.creating;
	const showTitleInput = task.creating;

	return (
		<>
			<div className={taskClass} onMouseEnter={handleHover} ref={taskRef}>
				<TaskStatic task={task} showTitle={showTitleStatic} />
				{showTitleInput && (
					<div className="taskContent__content">
						<TaskTitleInline id={task.id} title={task.title} />
					</div>
				)}
				{isTaskFocused && (
					<div className="taskContent__dependencyHandle">
						<div className="taskContent__dependencyHandle__tag" />
					</div>
				)}
			</div>
			{createPortal(
				<>
					<TaskOverflow
						direction="left"
						task={task}
						position={coordinatesStart}
						isVisible={isOverflowLeft}
						isInViewport={isTimelinInViewport}
						onClick={handleOverflowClick}
					/>
					<TaskOverflow direction="right" task={task} position={cordoinantesEnd} isVisible={isOverflowRight} onClick={handleOverflowClick} />
				</>,
				containerRef.current,
			)}
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
		left: taskRect.left - containerRect.left + container.scrollLeft - GANTT_JUMP_TO_TASK_PADDING_DAYS * GRID_WIDTH,
		right: taskRect.right - containerRect.left - containerRect.width + container.scrollLeft + GANTT_JUMP_TO_TASK_PADDING_DAYS * GRID_WIDTH,
	};

	container.scrollTo({
		left: xPosition[direction],
		behavior: "smooth",
	});
};
