import { useGanttStore } from "../../store/ganttStore";
import { TimelineBar } from "../TimelineBar";
import "./HeaderRange.css";

export const HeaderRange = () => {
	const dateRange = useGanttStore.use.headerTaskRange();

	const [start, end] = dateRange;

	if (!start || !end) {
		return null;
	}

	return <TimelineBar className="headerRange" start={start} end={end} />;
};
