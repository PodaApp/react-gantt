import { differenceInDays } from "date-fns";

import { COL_WIDTH } from "../constants";
import { getTaskFocusedQuery } from "../queries/getTaskFocusedQuery";
import { useGanttStore } from "../store/ganttStore";
import "./HeaderRange.css";

export const HeaderRange = () => {
	const node = useGanttStore(getTaskFocusedQuery);
	const dateStart = useGanttStore.use.dateStart();

	if (!node) {
		return null;
	}

	const rangeOffset = differenceInDays(node.start, dateStart) + 1;
	const rangeLength = differenceInDays(node.end, node.start) + 1;

	const width = rangeLength * COL_WIDTH;
	const x = rangeOffset * COL_WIDTH;

	return <div className="headerRange" style={{ width, transform: `translateX(${x}px)` }} />;
};
