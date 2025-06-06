import { ITask } from "../../types/tasks";
import { isTaskWithDate } from "../../utils/isTaskWithDate";
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
		<TimelineBar start={task.start} end={task.end} className="taskDragOverlay">
			<TaskStatic task={task} showBeacons={false} />
		</TimelineBar>
	);
};
