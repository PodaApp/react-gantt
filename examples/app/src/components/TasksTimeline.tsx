import { RefObject } from "react";

import { NewTask } from "./NewTask";
import { TasksSortable } from "./TasksSortable";
import "./TasksTimeline.css";
import { Today } from "./Today";
import { Weekends } from "./Weekends";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const TasksTimeline = ({ containerRef }: Props) => {
	return (
		<div className="tasksTimeline">
			<TasksSortable containerRef={containerRef} />
			<Today />
			<Weekends />
			<div className="tasksTimeline__addNew">
				<NewTask />
			</div>
		</div>
	);
};
