import { differenceInDays } from "date-fns";

import { GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import "./HeaderRange.css";

export const HeaderRange = () => {
	const dateRange = useGanttStore.use.headerTaskRange();
	const ganttDateStart = useGanttStore.use.ganttDateStart();

	const [start, end] = dateRange;

	if (!start || !end) {
		return null;
	}

	const rangeOffset = differenceInDays(start, ganttDateStart);
	const rangeLength = differenceInDays(end, start) + 1;

	const width = rangeLength * GRID_WIDTH;
	const x = rangeOffset * GRID_WIDTH;

	return <div className="headerRange" style={{ width, transform: `translateX(${x}px)` }} />;
};
