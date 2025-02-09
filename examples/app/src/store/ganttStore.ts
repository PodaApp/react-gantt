import { add, differenceInDays, sub } from "date-fns";
import { produce } from "immer";
import { create } from "zustand";

import { tasks as mockTasks } from "../__fixtures__/tasks";
import { GANTT_WIDTH_MONTHS } from "../constants";
import { createSelectors } from "../shared/zustand/createSelectors";
import { ITask, ITaskViewportPosition, ITaskWithDate } from "../types";

type TaskDate = Date | null;

export type GanttStoreState = {
	tasks: ITask[];
	tasksPositions: Record<string, ITaskViewportPosition>;
	tasksFocusedId: ITask["id"] | null;
	tasksEditingId: ITask["id"] | null;

	taskTableOpen: boolean;

	headerMonth: string | null;

	// TODO: Consider how I'm going to store dates
	dateCentered: Date;
	dateEnd: Date;
	dateStart: Date;
	dateFocusedRange: [TaskDate, TaskDate];
};

type GanttStoreActions = {
	setGantt: (dateCentered: Date) => void;
	setTasks: (tasks: GanttStoreState["tasks"]) => void;
	setTaskFocused: (task: ITaskWithDate) => void;
	setDateRangeFocused: (start: Date, end: Date) => void;
	setHeaderMonth: (month: GanttStoreState["headerMonth"]) => void;
	setTaskPositions: (id: string, options: Partial<ITaskViewportPosition>) => void;
	clearDateRangeFocused: () => void;
	createTask: (start: Date, end: Date) => void;
	createTaskAtIndex: (index: number) => void;
	setTask: (id: string, partialTask: ITask) => void;
	setTaskEditing: (id: GanttStoreState["tasksEditingId"]) => void;
	setTaskStart: (id: string, start: Date) => void;
	setTaskEnd: (id: string, end: Date) => void;
	// Maintins the current tasks duration
	setTaskNewStart: (id: string, newStart: Date) => void;
	setTaskTitle: (id: string, title: string | undefined) => void;
	setTaskTableOpen: (open: boolean) => void;
};

export type IGanttStore = GanttStoreState & GanttStoreActions;

// TODO Will need a way to specify a GUID generator;
const dodgyGuid = () => Math.floor(Math.random() * 1000000).toString();
const today = Object.freeze(new Date());

const store = create<IGanttStore>((set, get) => ({
	tasks: mockTasks,
	tasksPositions: {},
	tasksFocusedId: null,
	tasksEditingId: null,
	taskTableOpen: true,
	headerMonth: null,
	dateCentered: today,
	dateEnd: add(today, { months: GANTT_WIDTH_MONTHS }),
	dateStart: sub(today, { months: GANTT_WIDTH_MONTHS }),
	dateFocusedRange: [null, null],
	setGantt: (dateCentered) => {
		set({
			dateCentered: Object.freeze(dateCentered),
			dateEnd: Object.freeze(add(dateCentered, { months: GANTT_WIDTH_MONTHS })),
			dateStart: Object.freeze(sub(dateCentered, { months: GANTT_WIDTH_MONTHS })),
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

	setTaskEditing: (id) => set({ tasksEditingId: id }),

	setDateRangeFocused: (start, end) => {
		set({
			dateFocusedRange: [start, end],
		});
	},

	clearDateRangeFocused: () => {
		set({
			dateFocusedRange: [null, null],
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

	createTaskAtIndex: (index) => {
		const tasks = get().tasks;
		const newTask: ITask = {
			id: dodgyGuid(),
			creating: true,
			title: "",
			start: null,
			end: null,
		};

		set({
			tasksEditingId: newTask.id,
			tasks: produce(tasks, (draft) => {
				draft.splice(index, 0, newTask);
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

		if (!current?.start || !current?.end) {
			throw new Error("Task must have start and end date");
		}

		const deltaDays = differenceInDays(newStart, current.start);
		const newEnd = add(current.end, { days: deltaDays });

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

	setTaskTableOpen: (open) => {
		set({ taskTableOpen: open });
	},
}));

export const useGanttStore = createSelectors(store);
