import { GANTT_NEW_TASK_SIZE_DAYS, GRID_WIDTH } from "../constants";
import { GanttStoreState, useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";

export const mockWidth = GANTT_NEW_TASK_SIZE_DAYS * GRID_WIDTH;

type Props = {
	taskId?: ITask["id"];
};

export const NewTaskPlaceholder = ({ taskId }: Props) => {
	const x = useGanttStore(_getX(taskId));

	const placeholderPosition = {
		"--task-width": `${mockWidth}px`,
		"--task-x": `${x}px`,
	} as React.CSSProperties;

	return <div className="taskContent__bar taskWithDate__bar" style={placeholderPosition} />;
};

const _getX = (taskId?: string) => (state: GanttStoreState) => {
	const taskPosition = state.ganttSchedulingTaskPosition;

	if (!taskPosition || taskPosition.id !== taskId) {
		return null;
	}

	return taskPosition.x;
};
