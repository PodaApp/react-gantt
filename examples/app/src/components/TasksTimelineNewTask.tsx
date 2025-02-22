import { GanttStoreState, useGanttStore } from "../store/ganttStore";
import { NewTaskButton } from "./NewTaskButton";

export const TasksTimelineNewTask = () => {
	const isVisible = useGanttStore(_isVisible);

	if (!isVisible) {
		return null;
	}

	return <NewTaskButton hide="onOpen" />;
};

const _isVisible = (state: GanttStoreState) => {
	return state.ganttSchedulingTaskId === null;
};
