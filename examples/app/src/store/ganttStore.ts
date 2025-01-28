import { add, sub } from "date-fns";
import { produce } from "immer";
import { create } from "zustand";

import { GANTT_MONTH_BUFFER } from "../constants";
import { createSelectors } from "../shared/zustand/createSelectors";
import { ITask } from "../types";

export type GanttStoreState = {
	tasks: ITask[];

	// TODO: Consider how I'm going to store dates
	dateCentered: number;
	dateEnd: number;
	dateStart: number;
};

type GanttStoreActions = {
	setGantt: (dateCentered: number) => void;
	setTasks: (tasks: ITask[]) => void;
	setTaskFocused: (id: string) => void;
};

export type IGanttStore = GanttStoreState & GanttStoreActions;

const store = create<IGanttStore>((set, get) => ({
	tasks: [],
	dateCentered: 0,
	dateEnd: 0,
	dateStart: 0,

	setGantt: (dateCentered) => {
		set({
			dateCentered,
			dateEnd: add(dateCentered, { months: GANTT_MONTH_BUFFER }).getTime(),
			dateStart: sub(dateCentered, { months: GANTT_MONTH_BUFFER }).getTime(),
		});
	},

	setTasks: (tasks) => set({ tasks }),

	setTaskFocused: (id) => {
		const tasks = get().tasks;

		set({
			tasks: produce(tasks, (draft) => {
				const focusedCurrent = draft.find((task) => task.focused);
				const focusedNext = draft.find((task) => task.id === id);

				if (focusedCurrent?.id === id) {
					return draft;
				}

				if (focusedCurrent) {
					focusedCurrent.focused = false;
				}
				if (focusedNext) {
					focusedNext.focused = true;
				}

				return draft;
			}),
		});
	},
}));

export const useGanttStore = createSelectors(store);
