import { GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";
import "./Today.css";

export const Today = () => {
	const dateStart = useGanttStore.use.ganttDateStart();

	const x = getOffsetFromDate(new Date(), dateStart) + GRID_WIDTH / 2;

	return <div className="today" style={{ transform: `translateX(${x}px)` }} />;
};
