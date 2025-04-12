import { useContext, useMemo } from "react";

import { StoreApi } from "zustand";

import { GanttContext } from "../store/GanttContext";
import { IGanttStore } from "../store/ganttStore";
import { ITask } from "../types/tasks";

export const useStoreApi = <TaskType extends ITask = ITask>() => {
	const store = useContext(GanttContext) as StoreApi<IGanttStore<TaskType>> | null;

	if (store === null) {
		throw new Error("Gantt store not found");
	}

	return useMemo(
		() => ({
			getState: store.getState,
			setState: store.setState,
			subscribe: store.subscribe,
		}),
		[store],
	);
};
