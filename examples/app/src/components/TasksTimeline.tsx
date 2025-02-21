import { RefObject } from "react";

import { useTimelineConfig } from "../hooks/useTimelineConfig";
import { FirstOfTheMonths } from "./FirstOfTheMonths";
import { Tasks } from "./Tasks";
import "./TasksTimeline.css";
import { TaskWithoutDate } from "./TaskWithoutDate";
import { Today } from "./Today";
import { Weekends } from "./Weekends";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const TasksTimeline = ({ containerRef }: Props) => {
	const { showFirstOfTheMonths, showWeekends } = useTimelineConfig();

	return (
		<div className="tasksTimeline">
			<Tasks containerRef={containerRef} />
			<Today />
			{showFirstOfTheMonths && <FirstOfTheMonths />}
			{showWeekends && <Weekends />}
			<div className="tasksTimeline__addNew">
				<TaskWithoutDate />
			</div>
		</div>
	);
};
