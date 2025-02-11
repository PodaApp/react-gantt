import { differenceInDays } from "date-fns";

import { GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import "./Today.css";

export const Today = () => {
	const dateStart = useGanttStore.use.ganttDateStart();

	const offset = differenceInDays(new Date(), dateStart) + 1;
	const x = offset * GRID_WIDTH - GRID_WIDTH / 1.9;

	return <div className="today" style={{ transform: `translateX(${x}px)` }} />;
};
