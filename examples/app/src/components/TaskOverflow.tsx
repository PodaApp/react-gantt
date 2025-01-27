import { useCallback } from "react";

import classNames from "classnames";
import { format } from "date-fns";

import left from "../assets/move-left.svg";
import right from "../assets/move-right.svg";
import { DATE_FORMAT_SHORT_MONTH } from "../constants";
import { ITask } from "../types";
import { RightArrow } from "./RightArrow";
import "./TaskOverflow.css";

export type TaskOverflowDirection = "left" | "right";
export type TaskOverflowOnClick = (position: TaskOverflowDirection) => void;

type Props = {
	task: ITask;
	direction: TaskOverflowDirection;
	position: { x: number; y: number } | null;
	isInViewport?: boolean;
	onClick: TaskOverflowOnClick;
};

export const TaskOverflow: React.FC<Props> = ({ task, direction, position, isInViewport = false, onClick }) => {
	const iconSrc = direction === "left" ? left : right;

	const startDate = format(task.start, DATE_FORMAT_SHORT_MONTH);
	const endDate = format(task.end, DATE_FORMAT_SHORT_MONTH);

	const handleOverflowClick = useCallback(() => {
		onClick(direction);
	}, [direction, onClick]);

	const tooltipClass = classNames({
		taskOverflow__tooltip: "true",
		"taskOverflow__tooltip--right": direction === "right",
	});

	if (!position) {
		throw new Error("TaskOverflow must include position cordinates");
	}

	return (
		<div className="taskOverflow" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
			<button className="taskOverflow__button" onClick={handleOverflowClick}>
				<img src={iconSrc} />
			</button>
			<div className={tooltipClass}>
				{startDate} <RightArrow /> {endDate}
			</div>
			{isInViewport && <div className="task__title">{task.title}</div>}
		</div>
	);
};
