import { arrayMove } from "@dnd-kit/sortable";
import { add, differenceInDays, sub } from "date-fns";
import { produce } from "immer";
import { create } from "zustand";

import { tasks as mockTasks } from "../__fixtures__/tasks";
import { GANTT_NEW_TASK_SIZE_DAYS, GANTT_WIDTH_MONTHS, TASK_ID_UNCOMMITED } from "../constants";
import { createSelectors } from "../shared/zustand/createSelectors";
import { ITask, ITaskViewportPosition, ITaskWithDate } from "../types";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { getDateRangeFromOffset } from "../utils/getDateRangeFromOffset";

type TaskDate = Date | null;

export type GanttStoreState = {
	draggingActiveIndex: number | null;
	draggingOverId: string | null;
	draggingTask: ITask | null;

	gantDateCentered: Date;
	ganttDateEnd: Date;
	ganttDateStart: Date;
	ganttTaskListOpen: boolean;
	ganttSchedulingTask: string | null;

	headerMonth: string | null;
	headerTaskRange: [TaskDate, TaskDate];

	taskEditingId: ITask["id"] | null;
	taskFocusedId: ITask["id"] | null;
	taskOverPosition: { id: string | undefined; position: "before" | "after" } | null;

	tasks: ITask[];
	tasksPosition: Record<string, ITaskViewportPosition>;
};

type GanttStoreActions = {
	scheduleTask: (id: ITask["id"] | undefined, offsetX: number) => void;
	scheduleTaskClear: () => void;
	scheduleTaskConfirm: (id: ITask["id"]) => void;
	setDragActive: (task: ITask | null) => void;
	setDragOverId: (overId: ITask["id"] | null) => void;
	setGantt: (dateCentered: Date) => void;
	setGanttTaskListOpen: (open: boolean) => void;
	setHeaderMonth: (month: GanttStoreState["headerMonth"]) => void;
	setHeaderTaskRange: (start: TaskDate, end: TaskDate) => void;
	setTask: (id: ITask["id"], partialTask: ITask) => void;
	setTaskDateEnd: (id: ITask["id"], end: Date) => void;
	setTaskDateStart: (id: ITask["id"], start: Date) => void;
	setTaskEditing: (id: ITask["id"] | null) => void;
	setTaskFocused: (task: ITaskWithDate) => void;
	setTaskPositions: (id: ITask["id"], options: Partial<ITaskViewportPosition>) => void;
	setTaskRange: (id: ITask["id"], start: Date, end: Date) => void;
	setTasks: (tasks: GanttStoreState["tasks"]) => void;
	setTaskTitle: (id: ITask["id"], title: string | undefined) => void;
	taskCreate: (start: Date, end: Date) => void;
	taskCreateAtEnd: () => void;
	taskCreateAtIndex: (index: number) => void;
	taskUpdateRank: (id: ITask["id"], overId: string) => void;
	taskUpdateSchedule: (id: ITask["id"], offset: number) => void;
};

export type IGanttStore = GanttStoreState & GanttStoreActions;

// TODO Will need a way to specify a GUID generator;
const dodgyGuid = () => Math.floor(Math.random() * 1000000).toString();
const today = Object.freeze(new Date());

const store = create<IGanttStore>((set, get) => ({
	draggingActiveIndex: null,
	draggingOverId: null,
	draggingTask: null,
	gantDateCentered: today,
	ganttDateEnd: add(today, { months: GANTT_WIDTH_MONTHS }),
	ganttDateStart: sub(today, { months: GANTT_WIDTH_MONTHS }),
	ganttSchedulingTask: null,
	ganttTaskListOpen: true,
	headerMonth: null,
	headerTaskRange: [null, null],
	taskEditingId: null,
	taskFocusedId: null,
	taskOverPosition: null,
	tasks: mockTasks,
	tasksPosition: {},
	setGantt: (dateCentered) => {
		set({
			gantDateCentered: Object.freeze(dateCentered),
			ganttDateEnd: Object.freeze(add(dateCentered, { months: GANTT_WIDTH_MONTHS })),
			ganttDateStart: Object.freeze(sub(dateCentered, { months: GANTT_WIDTH_MONTHS })),
		});
	},

	setDragActive: (task) => {
		const { tasks } = get();
		const index = tasks.findIndex((t) => t.id === task?.id);

		set({ draggingActiveIndex: index, draggingTask: task, ...(task === null && { draggingOverId: null }) });
	},
	setDragOverId: (id) => set({ draggingOverId: id }),

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

	taskCreate: (start, end) => {
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

	taskCreateAtIndex: (index) => {
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

	taskCreateAtEnd: () => {
		const { tasks, taskCreateAtIndex: createTaskAtIndex } = get();
		const index = tasks.length;
		createTaskAtIndex(index);
	},

	taskUpdateRank: (id, overId) => {
		const { tasks, setTasks } = get();

		const activeIndex = tasks.findIndex((task) => task.id === id);
		const overIndex = tasks.findIndex((task) => task.id === overId);

		if (activeIndex === overIndex) {
			return;
		}

		setTasks(arrayMove(tasks, activeIndex, overIndex));
	},

	scheduleTask: (id, offsetX) => {
		const { ganttDateStart, headerTaskRange } = get();

		const [start, end] = getDateRangeFromOffset(offsetX, ganttDateStart, GANTT_NEW_TASK_SIZE_DAYS);

		if (start === headerTaskRange[0]) {
			return;
		}

		set({
			ganttSchedulingTask: id || null,
			headerTaskRange: [start, end],
		});
	},

	scheduleTaskClear: () => {
		set({
			ganttSchedulingTask: null,
			headerTaskRange: [null, null],
		});
	},

	scheduleTaskConfirm: (taskId) => {
		const { ganttSchedulingTask, headerTaskRange, setTaskRange, taskCreate: createTask } = get();
		const [start, end] = headerTaskRange;

		if (!ganttSchedulingTask || !start || !end) {
			return;
		}

		if (taskId !== TASK_ID_UNCOMMITED) {
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

	taskUpdateSchedule: (id, offset) => {
		const { ganttDateStart, tasks, setTask } = get();

		const task = tasks.find((task) => task.id === id);

		if (!task) {
			throw new Error("Task not found");
		}

		if (!task.start || !task.end) {
			throw new Error(`Task ${id} must have start and end date`);
		}

		const newStart = getDateFromOffset(offset, ganttDateStart);

		if (newStart.getTime() === task.start.getTime()) {
			return;
		}

		const deltaDays = differenceInDays(newStart, task.start);
		const newEnd = add(task.end, { days: deltaDays });

		setTask(id, { ...task, start: newStart, end: newEnd });
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
