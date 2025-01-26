import classNames from "classnames";
import { differenceInDays, format, getDayOfYear } from "date-fns";

import left from "../assets/move-left.svg";
import right from "../assets/move-right.svg";
import { COL_WIDTH } from "../constants";
import { ITask, ITaskPosition } from "../types";
import { RightArrow } from "./RightArrow";
import "./Task.css";

type Props = {
	data: ITask;
	sticky: ITaskPosition | null;
	onHover: (task: ITask) => void;
};

export const Task = ({ data, sticky, onHover }: Props) => {
	const rangeOffset = getDayOfYear(data.start) - 1;
	const rangeLength = differenceInDays(data.end, data.start) + 1;

	const width = rangeLength * COL_WIDTH;
	const x = rangeOffset * COL_WIDTH;

	const handleHover = () => {
		onHover(data);
	};

	const taskClass = classNames({
		task: true,
		"task--focused": data.focused,
	});

	const style: React.CSSProperties = sticky?.overflowLeft
		? { position: "fixed", top: `${sticky.top}px`, left: `${sticky.left}px`, zIndex: 10 }
		: { position: "static", zIndex: 10 };
	const styleRight: React.CSSProperties = sticky?.overflowRight
		? { position: "fixed", top: `${sticky.top}px`, left: `${sticky.right - 30}px`, zIndex: 10 }
		: {};

	return (
		<>
			{sticky?.overflowLeft && (
				<div className="task__content" style={style}>
					{sticky?.overflowLeft && (
						<div className="task__offscreen">
							<img src={left} />
						</div>
					)}
					<div className="task__offscreenTooltip">
						{format(data.start, "MMM dd, yyyy")} <RightArrow /> {format(data.end, "MMM dd, yyyy")}
					</div>
					{!sticky?.gone && <div className="task__title">{data.title}</div>}
				</div>
			)}
			<div className={taskClass} style={{ width: `${width}px`, transform: `translateX(${x}px)` }} onMouseEnter={handleHover}>
				<div className="task__beacon" data-position="start" data-id={data.id} />
				<div className="task__bar" data-id={data.id}></div>
				<div className="task__beacon" data-position="end" data-id={data.id} />

				{!sticky?.overflowLeft && (
					<div className="task__content">
						<div className="task__title">{data.title}</div>
					</div>
				)}
				{data.focused && (
					<div className="task__dependencyHandle">
						<div className="task__dependencyHandle__tag" />
					</div>
				)}
			</div>
			{sticky?.overflowRight && (
				<div className="task__content" style={styleRight}>
					<div className="task__offscreen task__offscreen--right">
						<img src={right} />
					</div>
				</div>
			)}
		</>
	);
};
