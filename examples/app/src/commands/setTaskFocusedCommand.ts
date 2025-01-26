import { ITask } from "../types";

export const setTaskFocusedCommand = (taskId: string) => (tasks: ITask[]) => {
	const nextActiveIndex = tasks.findIndex(({ id }) => id === taskId);
	const prevActiveIndex = tasks.findIndex((task) => task.focused);

	const nextFocused = tasks[nextActiveIndex];
	const prevFocused = tasks[prevActiveIndex];

	if (!nextFocused && !prevFocused) {
		return tasks;
	}

	const newTasks = tasks.slice(0);

	if (prevFocused) {
		newTasks[prevActiveIndex] = {
			...prevFocused,
			focused: false,
		};
	}

	if (nextFocused) {
		newTasks[nextActiveIndex] = {
			...nextFocused,
			focused: true,
		};
	}

	return newTasks;
};
