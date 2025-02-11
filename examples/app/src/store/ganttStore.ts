import { add, differenceInDays, sub } from "date-fns";
import { produce } from "immer";
import { create } from "zustand";

import { tasks as mockTasks } from "../__fixtures__/tasks";
import { GANTT_NEW_TASK_SIZE_DAYS, GANTT_WIDTH_MONTHS } from "../constants";
import { createSelectors } from "../shared/zustand/createSelectors";
import { ITask, ITaskViewportPosition, ITaskWithDate } from "../types";
import { getDateRangeFromOffset } from "../utils/getDateRangeFromOffset";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";

type TaskDate = Date | null;

export type GanttStoreState = {
	gantDateCentered: Date;
	ganttDateEnd: Date;
	ganttDateStart: Date;
	ganttTaskListOpen: boolean;
	ganttSchedulingTaskPosition: { id: string | undefined; x: number } | null;

	headerMonth: string | null;
	headerTaskRange: [TaskDate, TaskDate];

	taskEditingId: ITask["id"] | null;
	taskFocusedId: ITask["id"] | null;

	tasks: ITask[];
	tasksPosition: Record<string, ITaskViewportPosition>;
};

type GanttStoreActions = {
	createTask: (start: Date, end: Date) => void;
	createTaskAtIndex: (index: number) => void;
	createTaskAtEnd: () => void;
	scheduleTask: (id: ITask["id"] | undefined, offsetX: number) => void;
	scheduleTaskClear: () => void;
	scheduleTaskConfirm: (id?: ITask["id"]) => void;
	setGantt: (dateCentered: Date) => void;
	setGanttTaskListOpen: (open: boolean) => void;
	setHeaderMonth: (month: GanttStoreState["headerMonth"]) => void;
	setHeaderTaskRange: (start: TaskDate, end: TaskDate) => void;
	setTask: (id: string, partialTask: ITask) => void;
	setTaskDateEnd: (id: string, end: Date) => void;
	setTaskDateStart: (id: string, start: Date) => void;
	setTaskEditing: (id: GanttStoreState["taskEditingId"]) => void;
	setTaskFocused: (task: ITaskWithDate) => void;
	setTaskNewStart: (id: string, start: Date) => void;
	setTaskPositions: (id: string, options: Partial<ITaskViewportPosition>) => void;
	setTaskRange: (id: string, start: Date, end: Date) => void;
	setTaskTitle: (id: string, title: string | undefined) => void;
	setTasks: (tasks: GanttStoreState["tasks"]) => void;
};

export type IGanttStore = GanttStoreState & GanttStoreActions;

// TODO Will need a way to specify a GUID generator;
const dodgyGuid = () => Math.floor(Math.random() * 1000000).toString();
const today = Object.freeze(new Date());

const store = create<IGanttStore>((set, get) => ({
	gantDateCentered: today,
	ganttDateEnd: add(today, { months: GANTT_WIDTH_MONTHS }),
	ganttDateStart: sub(today, { months: GANTT_WIDTH_MONTHS }),
	headerMonth: null,
	headerTaskRange: [null, null],
	tasks: mockTasks,
	taskEditingId: null,
	taskFocusedId: null,
	tasksPosition: {},
	ganttTaskListOpen: false,
	ganttSchedulingTaskPosition: null,
	setGantt: (dateCentered) => {
		set({
			gantDateCentered: Object.freeze(dateCentered),
			ganttDateEnd: Object.freeze(add(dateCentered, { months: GANTT_WIDTH_MONTHS })),
			ganttDateStart: Object.freeze(sub(dateCentered, { months: GANTT_WIDTH_MONTHS })),
		});
	},

	setHeaderMonth: (headerMonth) => set({ headerMonth }),

	setTaskPositions: (id, options) => {
		const { tasksPosition } = get();

		set({
			tasksPosition: produce(tasksPosition, (draft) => {
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
			headerTaskRange: [task.start, task.end],
			taskFocusedId: task.id,
		});
	},

	setTaskEditing: (id) => set({ taskEditingId: id }),

	setHeaderTaskRange: (start, end) => {
		set({
			headerTaskRange: [start, end],
		});
	},

	createTask: (start, end) => {
		const { tasks } = get();

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
		const { tasks } = get();

		const newTask: ITask = {
			id: dodgyGuid(),
			creating: true,
			title: "",
			start: null,
			end: null,
		};

		set({
			taskEditingId: newTask.id,
			tasks: produce(tasks, (draft) => {
				draft.splice(index, 0, newTask);
				return draft;
			}),
		});
	},

	createTaskAtEnd: () => {
		const { tasks, createTaskAtIndex } = get();
		const index = tasks.length;
		createTaskAtIndex(index);
	},

	scheduleTask: (id, offsetX) => {
		const { ganttDateStart, ganttSchedulingTaskPosition } = get();

		const [start, end] = getDateRangeFromOffset(offsetX, ganttDateStart, GANTT_NEW_TASK_SIZE_DAYS);
		const nextX = getOffsetFromDate(start, ganttDateStart);

		if (nextX === ganttSchedulingTaskPosition?.x) {
			return;
		}

		set({
			ganttSchedulingTaskPosition: { id, x: nextX },
			headerTaskRange: [start, end],
		});
	},

	scheduleTaskClear: () => {
		set({
			ganttSchedulingTaskPosition: null,
			headerTaskRange: [null, null],
		});
	},

	scheduleTaskConfirm: (taskId) => {
		const { ganttSchedulingTaskPosition: taskPosition, ganttDateStart, setTaskRange, createTask } = get();

		if (taskPosition === null) {
			return;
		}

		const [start, end] = getDateRangeFromOffset(taskPosition.x, ganttDateStart, GANTT_NEW_TASK_SIZE_DAYS);

		if (taskId) {
			setTaskRange(taskId, start, end);
		} else {
			createTask(start, end);
		}
	},

	setTask: (id, data) => {
		const { tasks } = get();

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
			headerTaskRange: [data.start, data.end],
		});
	},

	setTaskRange: (id, start, end) => {
		const { tasks, setTask } = get();

		const current = tasks.find((task) => task.id === id);

		if (!current) {
			throw new Error("No task found to update");
		}

		if (current.start === start && current.end === end) {
			return;
		}

		setTask(id, { ...current, start, end });
	},

	setTaskNewStart: (id, newStart) => {
		const { tasks, setTask } = get();

		const current = tasks.find((task) => task.id === id);

		if (!current?.start || !current?.end) {
			throw new Error("Task must have start and end date");
		}

		const deltaDays = differenceInDays(newStart, current.start);
		const newEnd = add(current.end, { days: deltaDays });

		setTask(id, { ...current, start: newStart, end: newEnd });
	},

	// TODO: Merge task setters into single method
	setTaskDateEnd: (id, end) => {
		const { tasks, setTask } = get();

		const current = tasks.find((task) => task.id === id);

		if (!current) {
			throw new Error("No task found to update");
		}

		if (current.end === end) {
			return;
		}

		setTask(id, { ...current, end });
	},

	setTaskDateStart: (id, start) => {
		const { tasks, setTask } = get();

		const current = tasks.find((task) => task.id === id);

		if (!current) {
			throw new Error("No task found to update");
		}

		if (current.start === start) {
			return;
		}

		setTask(id, { ...current, start });
	},

	setTaskTitle: (id, title) => {
		const { tasks, setTask } = get();

		const current = tasks.find((task) => task.id === id);

		if (!current) {
			throw new Error("No task found to update");
		}

		const nextTitle = title || "New Task";

		if (current.title === nextTitle) {
			return;
		}

		setTask(id, { ...current, title: nextTitle });
	},

	setGanttTaskListOpen: (open) => {
		set({ ganttTaskListOpen: open });
	},
}));

export const useGanttStore = createSelectors(store);
