import { RefObject, useCallback, useRef } from "react";

import classNames from "classnames";
import { createPortal } from "react-dom";

import { GANTT_JUMP_TO_TASK_PADDING_DAYS } from "../constants";
import { useTaskPosition } from "../hooks/useTaskPosition";
import { GanttStoreState, useGanttStore } from "../store/ganttStore";
import { ITaskWithDate } from "../types";
import "./TaskContent.css";
import { TaskOverflow, TaskOverflowDirection, TaskOverflowOnClick } from "./TaskOverflow";
import { TaskStatic } from "./TaskStatic";
import { TaskTitleInline } from "./TaskTitleInline";

export type TaskOnHover = (taskId: string) => void;

export type TaskProps = {
	task: ITaskWithDate;
	containerRef: RefObject<HTMLDivElement>;
};

// TODO: Move to querys
const _getPositionForTask = (id: ITaskWithDate["id"]) => (s: GanttStoreState) => s.tasksPosition[id];
const _getIsFocused = (id: ITaskWithDate["id"]) => (s: GanttStoreState) => s.taskFocusedId === id;

export const TaskContent = ({ task, containerRef }: TaskProps) => {
	const taskRef = useRef<HTMLDivElement>(null);

	const stickyPosition = useGanttStore(_getPositionForTask(task.id));
	const isTaskFocused = useGanttStore(_getIsFocused(task.id));
	const setTaskFocused = useGanttStore.use.setTaskFocused();

	const { getWidthFromDays } = useTaskPosition();

	const handleHover = useCallback(() => setTaskFocused(task), [setTaskFocused, task]);

	const handleOverflowClick: TaskOverflowOnClick = useCallback(
		(direction) => {
			const paddingWidth = getWidthFromDays(GANTT_JUMP_TO_TASK_PADDING_DAYS);

			_scrollToPosition(direction, containerRef.current, taskRef.current, paddingWidth);
		},
		[containerRef, getWidthFromDays],
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

	const showTitleStatic = !isOverflowLeft && !task.creating;
	const showTitleInput = task.creating;

	return (
		<>
			<div className={taskClass} onMouseEnter={handleHover} ref={taskRef}>
				<TaskStatic task={task} showTitle={showTitleStatic} />
				{showTitleInput && (
					<div className="taskContent__content">
						<TaskTitleInline id={task.id} placeholder="Type a name..." title={task.title} />
					</div>
				)}
			</div>
			{containerRef.current &&
				createPortal(
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

const _scrollToPosition = (direction: TaskOverflowDirection, container: HTMLElement | null, task: HTMLElement | null, paddingWidth: number): void => {
	if (!container || !task) {
		throw new Error("Can't find a required element");
	}

	const containerRect = container.getBoundingClientRect();
	const taskRect = task.getBoundingClientRect();

	const xPosition: { left: number; right: number } = {
		left: taskRect.left - containerRect.left + container.scrollLeft - paddingWidth,
		right: taskRect.right - containerRect.left - containerRect.width + container.scrollLeft + paddingWidth,
	};

	container.scrollTo({
		left: xPosition[direction],
		behavior: "smooth",
	});
};
