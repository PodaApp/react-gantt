import { useCallback } from "react";

import classNames from "classnames";
import { format } from "date-fns";

import { DATE_FORMAT_SHORT_MONTH } from "../../constants";
import { ITaskWithDate } from "../../types";
import { ArrowRight } from "../icons/ArrowRight";
import { MoveLeft } from "../icons/MoveLeft";
import { MoveRight } from "../icons/MoveRight";
import { Tooltip } from "../timeline/Tooltip";

import "./TaskOverflow.css";

export type TaskOverflowDirection = "left" | "right";
export type TaskOverflowOnClick = (position: TaskOverflowDirection) => void;

type Props = {
	task: ITaskWithDate;
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

	if (!position || !isVisible) {
		return null;
	}

	const buttonClass = classNames({
		taskOverflow__button: true,
		"taskOverflow__button--active": isVisible,
	});

	const Icon = direction === "left" ? MoveLeft : MoveRight;
	const startDate = format(task.start, DATE_FORMAT_SHORT_MONTH);
	const endDate = format(task.end, DATE_FORMAT_SHORT_MONTH);

	const tip = (
		<div className="taskOverflow__tooltip">
			{startDate} <ArrowRight /> {endDate}
		</div>
	);

	return (
		<div className="taskOverflow" style={{ [direction]: `${0}px`, top: `${position.y}px` }}>
			<Tooltip direction={direction} tip={tip}>
				<button className={buttonClass} onClick={handleOverflowClick}>
					<Icon />
				</button>
			</Tooltip>

			{isInViewport && <div className="task__title">{task.title}</div>}
		</div>
	);
};
