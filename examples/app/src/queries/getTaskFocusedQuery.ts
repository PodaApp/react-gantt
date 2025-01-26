import { ITask } from "../types";

export const getTaskFocusedQuery = (tasks: ITask[]): ITask | null => {
	return tasks.find((task) => task.focused) || null;
};
