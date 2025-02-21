import { ChangeEvent, RefObject, useCallback } from "react";

import { GanttStoreState, useGanttStore } from "../store/ganttStore";
import "./HeaderActions.css";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const HeaderActions = ({ containerRef }: Props) => {
	const zoom = useGanttStore.use.zoom();
	const zoomUpdate = useGanttStore.use.zoomUpdate();
	const setCenter = useGanttStore.use.setGanttCenter();

	const handleChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const zoom = event.target.value as GanttStoreState["zoom"];
			zoomUpdate(zoom, containerRef.current?.scrollLeft, containerRef.current?.offsetWidth);
		},
		[containerRef, zoomUpdate],
	);

	const handleToday = useCallback(() => {
		setCenter(new Date());
	}, [setCenter]);

	return (
		<div className="headerActions">
			{/* TODO: Build list from config */}
			<select className="headerActions__zoom" onChange={handleChange} value={zoom}>
				<option value="week">Week</option>
				<option value="month">Month</option>
				<option value="quarter">Quarter</option>
				<option value="year">Year</option>
			</select>
			<button className="headerActions__today" onClick={handleToday}>
				Today
			</button>
		</div>
	);
};
