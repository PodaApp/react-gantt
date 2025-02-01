import { add, sub } from "date-fns";
import { produce } from "immer";
import { create } from "zustand";

import { GANTT_MONTH_BUFFER } from "../constants";
import { createSelectors } from "../shared/zustand/createSelectors";
import { ITask, ITaskPosition } from "../types";

export type GanttStoreState = {
	// TODO: Consider storing this as a Map
	tasks: ITask[];
	tasksPositions: Record<string, ITaskPosition>;
	tasksFocusedId: ITask["id"] | null;

	headerMonth: string | null;

	// TODO: Consider how I'm going to store dates
	dateCentered: number;
	dateEnd: number;
	dateStart: number;
	dateFocusedRange: [string, string] | null;
};

type GanttStoreActions = {
	setGantt: (dateCentered: GanttStoreState["dateCentered"]) => void;
	setTasks: (tasks: GanttStoreState["tasks"]) => void;
	setTaskFocused: (task: ITask) => void;
	setDateRangeFocused: (start: string, end: string) => void;
	setHeaderMonth: (month: GanttStoreState["headerMonth"]) => void;
	setTaskPositions: (id: string, options: Partial<ITaskPosition>) => void;
	clearDateRangeFocused: () => void;
	createTask: (start: string, end: string) => void;
	setTask: (id: string, partialTask: Partial<ITask>) => void;
	setTaskStart: (id: string, start: string) => void;
	setTaskEnd: (id: string, end: string) => void;
};

export type IGanttStore = GanttStoreState & GanttStoreActions;

// TODO Will need a way to specify a GUID generator;
const dodgyGuid = () => Math.floor(Math.random() * 1000000).toString();

const store = create<IGanttStore>((set, get) => ({
	tasks: [],
	tasksPositions: {},
	tasksFocusedId: null,
	headerMonth: null,
	dateCentered: 0,
	dateEnd: 0,
	dateStart: 0,
	dateFocusedRange: null,

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

	setTaskFocused: (task) => {
		set({
			dateFocusedRange: [task.start, task.end],
			tasksFocusedId: task.id,
		});
	},

	setDateRangeFocused: (start, end) => {
		set({
			dateFocusedRange: [start, end],
		});
	},

	clearDateRangeFocused: () => {
		set({
			dateFocusedRange: null,
		});
	},

	createTask: (start, end) => {
		const tasks = get().tasks;
		const newTask: ITask = {
			id: dodgyGuid(),
			creating: true,
			title: "",
			start,
			end,
		};

		set({
			tasks: produce(tasks, (draft) => {
				draft.push(newTask);
				return draft;
			}),
		});
	},

	setTask: (id, data) => {
		const tasks = get().tasks;
		set({
			tasks: produce(tasks, (draft) => {
				const taskIndex = draft.findIndex((task) => task.id === id);
				const task = draft[taskIndex];

				if (task) {
					draft[taskIndex] = {
						...task,
						...data,
						creating: false,
					};
				}

				return draft;
			}),
		});
	},

	setTaskEnd: (id, end) => {
		const setTask = get().setTask;
		const current = get().tasks.find((task) => task.id === id);
		if (!current || current.end === end) {
			return;
		}

		setTask(id, { end });
	},
	setTaskStart: (id, start) => {
		const setTask = get().setTask;
		const current = get().tasks.find((task) => task.id === id);
		if (!current || current.start === start) {
			return;
		}

		setTask(id, { start });
	},
}));

export const useGanttStore = createSelectors(store);
