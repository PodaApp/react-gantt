import { RefObject } from "react";

import { Tasks } from "./Tasks";
import "./TasksTimeline.css";
import { TaskWithoutDate } from "./TaskWithoutDate";
import { Today } from "./Today";
import { Weekends } from "./Weekends";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const TasksTimeline = ({ containerRef }: Props) => {
	return (
		<div className="tasksTimeline">
			<Tasks containerRef={containerRef} />
			<Today />
			<Weekends />
			<div className="tasksTimeline__addNew">
				<TaskWithoutDate />
			</div>
		</div>
	);
};
