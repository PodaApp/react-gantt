import { useGanttStore } from "../../hooks/useGanttStore";
import { TimelineBar } from "../task/TimelineBar";

import "./HeaderRange.css";

export const HeaderRange = () => {
	const dateRange = useGanttStore((state) => state.headerTaskRange);

	const [start, end] = dateRange;

	if (!start || !end) {
		return null;
	}

	return <TimelineBar className="headerRange" start={start} end={end} />;
};
