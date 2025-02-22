import { ITask } from "../types";
import { isTaskWithDate } from "../utils/isTaskWithDate";
import { TaskStatic } from "./TaskStatic";
import { TimelineBar } from "./TimelineBar";

type Props = {
	task: ITask;
};

export const TaskDragOverlay = ({ task }: Props) => {
	if (!isTaskWithDate(task)) {
		return;
	}

	return (
		<TimelineBar start={task.start} end={task.end}>
			<TaskStatic task={task} showBeacons={false} />
		</TimelineBar>
	);
};
