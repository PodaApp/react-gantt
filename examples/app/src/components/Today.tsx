import { differenceInDays } from "date-fns";

import { GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import "./Today.css";

export const Today = () => {
	const dateStart = useGanttStore.use.dateStart();

	const offset = differenceInDays(new Date().toISOString(), new Date(dateStart).toISOString()) + 1;
	const x = offset * GRID_WIDTH - GRID_WIDTH / 1.9;

	return <div className="today" style={{ transform: `translateX(${x}px)` }} />;
};
