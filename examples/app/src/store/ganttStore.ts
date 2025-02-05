import { add, differenceInDays, sub } from "date-fns";
import { produce } from "immer";
import { create } from "zustand";

import { GANTT_WIDTH_MONTHS } from "../constants";
import { createSelectors } from "../shared/zustand/createSelectors";
import { ITask, ITaskViewportPosition } from "../types";

export type GanttStoreState = {
	// TODO: Consider storing this as a Map
	tasks: ITask[];
	tasksPositions: Record<string, ITaskViewportPosition>;
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
	setTaskPositions: (id: string, options: Partial<ITaskViewportPosition>) => void;
	clearDateRangeFocused: () => void;
	createTask: (start: string, end: string) => void;
	setTask: (id: string, partialTask: ITask) => void;
	setTaskStart: (id: string, start: string) => void;
	setTaskEnd: (id: string, end: string) => void;
	// Maintins the current tasks duration
	setTaskNewStart: (id: string, newStart: string) => void;
	setTaskTitle: (id: string, title: string | undefined) => void;
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
			dateEnd: add(dateCentered, { months: GANTT_WIDTH_MONTHS }).getTime(),
			dateStart: sub(dateCentered, { months: GANTT_WIDTH_MONTHS }).getTime(),
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
			dateFocusedRange: [data.start, data.end],
		});
	},

	setTaskNewStart: (id, newStart) => {
		const setTask = get().setTask;
		const current = get().tasks.find((task) => task.id === id);

		if (!current) {
			throw new Error("No task found to update");
		}

		const deltaDays = differenceInDays(newStart, current.start);
		const newEnd = add(current.end, { days: deltaDays }).toDateString();

		setTask(id, { ...current, start: newStart, end: newEnd });
	},

	// TODO: Merge task setters into single method
	setTaskEnd: (id, end) => {
		const setTask = get().setTask;
		const current = get().tasks.find((task) => task.id === id);

		if (!current) {
			throw new Error("No task found to update");
		}

		if (current.end === end) {
			return;
		}

		setTask(id, { ...current, end });
	},

	setTaskStart: (id, start) => {
		const setTask = get().setTask;
		const current = get().tasks.find((task) => task.id === id);

		if (!current) {
			throw new Error("No task found to update");
		}

		if (current.start === start) {
			return;
		}

		setTask(id, { ...current, start });
	},

	setTaskTitle: (id, title) => {
		const setTask = get().setTask;
		const current = get().tasks.find((task) => task.id === id);

		if (!current) {
			throw new Error("No task found to update");
		}

		const nextTitle = title || "New Task";

		if (current.title === nextTitle) {
			return;
		}

		setTask(id, { ...current, title: nextTitle });
	},
}));

export const useGanttStore = createSelectors(store);
