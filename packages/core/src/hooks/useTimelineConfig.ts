import { TIMELINE_CONFIG } from "../constants";
import { useGanttStore } from "../store/ganttStore";

export const useTimelineConfig = () => {
	const zoomLevel = useGanttStore((state) => state.zoom);
	const timelineConfig = TIMELINE_CONFIG[zoomLevel];

	const showFirstOfTheMonths = timelineConfig.components.includes("firstOfMonth");
	const showWeekends = timelineConfig.components.includes("weekends");
	const showAllDays = timelineConfig.headerScale === "days";

	return {
		timelineConfig,
		showFirstOfTheMonths,
		showWeekends,
		showAllDays,
	};
};
