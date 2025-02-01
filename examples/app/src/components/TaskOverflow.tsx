import { useCallback } from "react";

import classNames from "classnames";
import { format } from "date-fns";

import left from "../assets/move-left.svg";
import right from "../assets/move-right.svg";
import { DATE_FORMAT_SHORT_MONTH } from "../constants";
import { ITask } from "../types";
import { RightArrow } from "./RightArrow";
import "./TaskOverflow.css";
import { Tooltip } from "./Tooltip";

export type TaskOverflowDirection = "left" | "right";
export type TaskOverflowOnClick = (position: TaskOverflowDirection) => void;

type Props = {
	task: ITask;
	direction: TaskOverflowDirection;
	position: { x: number; y: number } | null;
	isVisible: boolean;
	isInViewport?: boolean;
	onClick: TaskOverflowOnClick;
};

export const TaskOverflow: React.FC<Props> = ({ task, direction, position, isVisible, isInViewport = false, onClick }) => {
	const handleOverflowClick = useCallback(() => {
		onClick(direction);
	}, [direction, onClick]);

	if (!position) {
		return null;
	}

	const buttonClass = classNames({
		taskOverflow__button: true,
		"taskOverflow__button--active": isVisible,
	});

	const iconSrc = direction === "left" ? left : right;
	const startDate = format(task.start, DATE_FORMAT_SHORT_MONTH);
	const endDate = format(task.end, DATE_FORMAT_SHORT_MONTH);

	const tip = (
		<div className="taskOverflow__tooltip">
			{startDate} <RightArrow /> {endDate}
		</div>
	);

	return (
		<div className="taskOverflow" style={{ [direction]: `${0}px`, top: `${position.y}px` }}>
			<Tooltip direction={direction} tip={tip}>
				<button className={buttonClass} onClick={handleOverflowClick}>
					<img src={iconSrc} />
				</button>
			</Tooltip>

			{isInViewport && isVisible && <div className="task__title">{task.title}</div>}
		</div>
	);
};
