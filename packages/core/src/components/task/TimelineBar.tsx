import { ReactNode } from "react";

import classNames from "classnames";

import { useTaskPosition } from "../../hooks/useTaskPosition";
import { ITaskOffset } from "../../types/tasks";

import "./TimelineBar.css";

type Props = {
	start: Date;
	end: Date;
	children?: ReactNode;
	className?: string;
	render?: (position: ITaskOffset) => ReactNode;
};

export const TimelineBar = ({ start, end, children, className, render }: Props) => {
	const { getTaskPosition } = useTaskPosition();

	const timelinePosition = getTaskPosition(start, end, false);
	const timelineClassName = classNames("timelineBar", className);

	const timelineStyles = {
		"--task-width": `${timelinePosition.width}px`,
		"--task-x": `${timelinePosition.x}px`,
	} as React.CSSProperties;

	const taskData = JSON.stringify({
		dateStart: start.toISOString(),
		dateEnd: end.toISOString(),
		width: timelinePosition.width,
		x: timelinePosition.x,
		duration: timelinePosition.duration,
	});

	return (
		<div className={timelineClassName} style={timelineStyles} data-computed={taskData}>
			{render ? render(timelinePosition) : children}
		</div>
	);
};
