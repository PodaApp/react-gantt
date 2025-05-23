import { useGanttStore } from "../../hooks/useGanttStore";
import { ITask } from "../../types/tasks";
import { TimelineBar } from "./TimelineBar";

type Props = {
	taskId?: ITask["id"];
};

export const NewTaskPlaceholder = ({ taskId }: Props) => {
	const ganttSchedulingTask = useGanttStore((state) => state.ganttSchedulingTaskId);
	const [start, end] = useGanttStore((state) => state.headerTaskRange);

	if (taskId !== ganttSchedulingTask || !start || !end) {
		return null;
	}

	return (
		<TimelineBar start={start} end={end} className="newTaskPlaceholder">
			<div className="taskContent__bar"></div>
		</TimelineBar>
	);
};
