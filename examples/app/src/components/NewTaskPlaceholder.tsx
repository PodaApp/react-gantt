import { GANTT_NEW_TASK_SIZE_DAYS, GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { TimelineBar } from "./TimelineBar";

export const mockWidth = GANTT_NEW_TASK_SIZE_DAYS * GRID_WIDTH;

type Props = {
	taskId?: ITask["id"];
};

export const NewTaskPlaceholder = ({ taskId }: Props) => {
	const ganttSchedulingTask = useGanttStore.use.ganttSchedulingTask();
	const [start, end] = useGanttStore.use.headerTaskRange();

	if (taskId !== ganttSchedulingTask || !start || !end) {
		return null;
	}

	return (
		<TimelineBar start={start} end={end}>
			<div className="taskContent__bar"></div>
		</TimelineBar>
	);
};
