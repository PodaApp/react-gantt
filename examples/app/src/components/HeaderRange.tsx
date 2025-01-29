import { differenceInDays } from "date-fns";

import { COL_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import "./HeaderRange.css";

export const HeaderRange = () => {
	const dateRange = useGanttStore.use.dateFocusedRange();
	const ganttDateStart = useGanttStore.use.dateStart();

	if (!dateRange) {
		return null;
	}

	const [start, end] = dateRange;

	const rangeOffset = differenceInDays(start, ganttDateStart) + 1;
	const rangeLength = differenceInDays(end, start) + 1;

	const width = rangeLength * COL_WIDTH;
	const x = rangeOffset * COL_WIDTH;

	return <div className="headerRange" style={{ width, transform: `translateX(${x}px)` }} />;
};
