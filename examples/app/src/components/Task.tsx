import { RefObject, useCallback, useRef } from "react";

import classNames from "classnames";
import { differenceInDays, getDayOfYear } from "date-fns";

import { COL_JUMP_TO_BUFFER_DAYS, COL_WIDTH } from "../constants";
import { ITask, ITaskPosition } from "../types";
import "./Task.css";
import { TaskOverflow, TaskOverflowDirection, TaskOverflowOnClick } from "./TaskOverflow";

type Props = {
	data: ITask;
	stickyPosition: ITaskPosition | null;
	containerRef: RefObject<HTMLDivElement>;
	onHover: (task: ITask) => void;
};

export const Task = ({ data, stickyPosition, containerRef, onHover }: Props) => {
	const taskRef = useRef<HTMLDivElement>(null);

	const rangeOffset = getDayOfYear(data.start) - 1;
	const rangeLength = differenceInDays(data.end, data.start) + 1;

	const width = rangeLength * COL_WIDTH;
	const x = rangeOffset * COL_WIDTH;

	const handleHover = useCallback(() => onHover(data), [data, onHover]);

	const handleOverflowClick: TaskOverflowOnClick = useCallback(
		(direction) => _scrollToPosition(direction, containerRef.current, taskRef.current),
		[containerRef],
	);

	const taskClass = classNames({
		task: true,
		"task--focused": data.focused,
	});

	const isOverflowLeft = !!stickyPosition?.overflowLeft;
	const isOverflowRight = !!stickyPosition?.overflowRight;
	const isTimelinInViewport = !stickyPosition?.gone;
	const isFocused = data.focused;

	const coordinatesStart = stickyPosition ? { x: stickyPosition.left, y: stickyPosition?.top } : null;
	const cordoinantesEnd = stickyPosition ? { x: stickyPosition?.right - 30, y: stickyPosition?.top } : null;

	return (
		<>
			{isOverflowLeft && (
				<TaskOverflow direction="left" position={coordinatesStart} task={data} isInViewport={isTimelinInViewport} onClick={handleOverflowClick} />
			)}
			<div className={taskClass} style={{ width: `${width}px`, transform: `translateX(${x}px)` }} onMouseEnter={handleHover} ref={taskRef}>
				<div className="task__beacon" data-position="start" data-id={data.id} />
				<div className="task__bar" data-id={data.id}></div>
				<div className="task__beacon" data-position="end" data-id={data.id} />

				{!isOverflowLeft && (
					<div className="task__content">
						<div className="task__title">{data.title}</div>
					</div>
				)}
				{isFocused && (
					<div className="task__dependencyHandle">
						<div className="task__dependencyHandle__tag" />
					</div>
				)}
			</div>
			{isOverflowRight && <TaskOverflow direction="right" position={cordoinantesEnd} task={data} onClick={handleOverflowClick} />}
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
