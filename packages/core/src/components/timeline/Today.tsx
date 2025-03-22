import { format, startOfDay } from "date-fns";

import { useTaskPosition } from "../../hooks/useTaskPosition";

import "./Today.css";

export const Today = () => {
	const { gridWidth, getX } = useTaskPosition();

	const today = startOfDay(new Date());

	const MID_POINT = gridWidth / 2;
	const BORDER_WIDTH = 1;

	const x = getX(today, { startsAtZero: true }) + MID_POINT - BORDER_WIDTH;
	const day = format(today, "d");

	return (
		<div className="today" style={{ transform: `translateX(${x}px)` }}>
			<div className="today__day">{day}</div>
		</div>
	);
};
