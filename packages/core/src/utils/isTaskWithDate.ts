import { ITaskWithDate } from "../types";

export const isTaskWithDate = (task: any): task is ITaskWithDate => {
	return task && task.start instanceof Date && task.end instanceof Date;
};
