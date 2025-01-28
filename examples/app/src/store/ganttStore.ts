import { add, sub } from "date-fns";
import { produce } from "immer";
import { create } from "zustand";

import { GANTT_MONTH_BUFFER } from "../constants";
import { createSelectors } from "../shared/zustand/createSelectors";
import { ITask, ITaskPosition } from "../types";

export type GanttStoreState = {
	tasks: ITask[];
	// TODO: Do I merge this with the task model above
	tasksPositions: Record<string, ITaskPosition>;

	headerMonth: string | null;

	// TODO: Consider how I'm going to store dates
	dateCentered: number;
	dateEnd: number;
	dateStart: number;
};

type GanttStoreActions = {
	setGantt: (dateCentered: GanttStoreState["dateCentered"]) => void;
	setTasks: (tasks: GanttStoreState["tasks"]) => void;
	setTaskFocused: (id: ITask["id"]) => void;
	setHeaderMonth: (month: GanttStoreState["headerMonth"]) => void;
	setTaskPositions: (id: string, options: Partial<ITaskPosition>) => void;
};

export type IGanttStore = GanttStoreState & GanttStoreActions;

const store = create<IGanttStore>((set, get) => ({
	tasks: [],
	tasksPositions: {},
	headerMonth: null,
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

	setHeaderMonth: (headerMonth) => set({ headerMonth }),

	setTaskPositions: (id, options) => {
		const tasksPositions = get().tasksPositions;

		set({
			tasksPositions: produce(tasksPositions, (draft) => {
				if (draft[id]) {
					draft[id] = { ...draft[id], ...options };
				} else {
					draft[id] = {
						top: 0,
						left: 0,
						right: 0,
						overflowLeft: false,
						overflowRight: false,
						gone: false,
						...options,
					};
				}
				return draft;
			}),
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
