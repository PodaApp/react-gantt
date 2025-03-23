import { arrayMove } from "@dnd-kit/sortable";
import { add, differenceInDays, isWithinInterval, startOfDay, startOfMonth, sub } from "date-fns";
import { produce } from "immer";
import { createStore } from "zustand";

import { DEFAULT_ZOOM, GRID_WIDTH, TASK_ID_UNCOMMITED, TIMELINE_CONFIG, TimelineZoomLevels } from "../constants";
import { ITask, ITaskViewportPosition, ITaskWithDate } from "../types";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { getDateRangeFromOffset } from "../utils/getDateRangeFromOffset";

type TaskDate = Date | null;

export type GanttStoreState = {
	draggingActiveIndex: number | null;
	draggingOverId: string | null;
	draggingTask: ITask | null;

	ganttDateCentered: Date;
	ganttDateEnd: Date;
	ganttDateStart: Date;
	ganttTaskListOpen: boolean;
	ganttSchedulingTaskId: string | null;

	headerMonth: string | null;
	headerTaskRange: [TaskDate, TaskDate];

	taskEditingId: ITask["id"] | null;
	taskFocusedId: ITask["id"] | null;
	taskOverPosition: { id: string | undefined; position: "before" | "after" } | null;

	tasks: ITask[];
	tasksPosition: Record<string, ITaskViewportPosition>;

	zoom: TimelineZoomLevels;
	zoomGridWidth: number;
	zoomOffsetRatio: number | null;
};

type GanttStoreActions = {
	scheduleTask: (id: ITask["id"] | undefined, offsetX: number) => void;
	scheduleTaskClear: () => void;
	scheduleTaskConfirm: (id: ITask["id"]) => void;
	setDragActive: (task: ITask | null) => void;
	setDragOverId: (overId: ITask["id"] | null) => void;
	setGanttCenter: (dateCentered: Date) => void;
	setGanttTaskListOpen: (open: boolean) => void;
	setHeaderMonth: (month: GanttStoreState["headerMonth"]) => void;
	setHeaderTaskRange: (start: TaskDate, end: TaskDate) => void;
	setTask: (id: ITask["id"], partialTask: ITask) => void;
	setTaskDateEnd: (id: ITask["id"], offset: number) => void;
	setTaskDateStart: (id: ITask["id"], offset: number) => void;
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
	zoomUpdate: (zoom: GanttStoreState["zoom"], currentLeft: number | undefined, width: number | undefined) => void;
	clearTaskFocused: () => void;
};

export type IGanttStore = GanttStoreState & GanttStoreActions;

// TODO Will need a way to specify a GUID generator;
const dodgyGuid = () => Math.floor(Math.random() * 1000000).toString();
// Need to strip time from this date
const today = Object.freeze(startOfDay(new Date()));

export const buildGanttStore = (initialState: Partial<GanttStoreState>) => {
	return createStore<IGanttStore>((set, get) => ({
		draggingActiveIndex: null,
		draggingOverId: null,
		draggingTask: null,
		ganttDateCentered: today,
		ganttDateEnd: add(today, { months: TIMELINE_CONFIG[DEFAULT_ZOOM].monthsPadding }),
		ganttDateStart: sub(today, { months: TIMELINE_CONFIG[DEFAULT_ZOOM].monthsPadding }),
		ganttSchedulingTaskId: null,
		ganttTaskListOpen: true,
		headerMonth: null,
		headerTaskRange: [null, null],
		taskEditingId: null,
		taskFocusedId: null,
		taskOverPosition: null,
		tasks: [],
		tasksPosition: {},
		zoom: "week",
		zoomGridWidth: GRID_WIDTH,
		zoomOffsetRatio: null,
		...initialState,

		setGanttCenter: (date) => {
			const { zoom, ganttDateStart, ganttDateEnd } = get();

			const monthsPadding = TIMELINE_CONFIG[zoom].monthsPadding;

			const dateIsInRange = isWithinInterval(date, { start: ganttDateStart, end: ganttDateEnd });

			const next: Partial<Pick<GanttStoreState, "ganttDateCentered" | "ganttDateEnd" | "ganttDateStart">> = {
				ganttDateCentered: Object.freeze(date),
			};

			if (!dateIsInRange) {
				next.ganttDateEnd = Object.freeze(add(date, { months: monthsPadding }));
				next.ganttDateStart = Object.freeze(sub(date, { months: monthsPadding }));
			}

			set(next);
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
			const { draggingTask } = get();

			if (draggingTask !== null) {
				return;
			}

			set({
				headerTaskRange: [task.start, task.end],
				taskFocusedId: task.id,
			});
		},

		clearTaskFocused: () => {
			set({
				taskFocusedId: null,
				headerTaskRange: [null, null],
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
				ganttSchedulingTaskId: null,
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
			const { ganttDateStart, zoom, zoomGridWidth, headerTaskRange } = get();

			const taskSize = TIMELINE_CONFIG[zoom].defaultTaskSizeDays - 1;

			const [start, end] = getDateRangeFromOffset(offsetX, taskSize, ganttDateStart, zoomGridWidth);

			if (start === headerTaskRange[0]) {
				return;
			}

			set({
				ganttSchedulingTaskId: id || null,
				headerTaskRange: [start, end],
			});
		},

		scheduleTaskClear: () => {
			set({
				ganttSchedulingTaskId: null,
				headerTaskRange: [null, null],
			});
		},

		scheduleTaskConfirm: (taskId) => {
			const { ganttSchedulingTaskId: ganttSchedulingTask, headerTaskRange, setTaskRange, taskCreate: createTask } = get();
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
			const { ganttDateStart, zoomGridWidth, tasks, setTask } = get();

			const task = tasks.find((task) => task.id === id);

			if (!task) {
				throw new Error("Task not found");
			}

			if (!task.start || !task.end) {
				throw new Error(`Task ${id} must have start and end date`);
			}

			const newStart = getDateFromOffset(ganttDateStart, offset, zoomGridWidth, { startsAtZero: true });

			if (newStart.getTime() === task.start.getTime()) {
				return;
			}

			const deltaDays = differenceInDays(startOfDay(newStart), startOfDay(task.start));
			const newEnd = add(task.end, { days: deltaDays });

			setTask(id, { ...task, start: newStart, end: newEnd });
		},

		// TODO: Merge task setters into single method
		setTaskDateEnd: (id, offset) => {
			const { tasks, setTask, zoomGridWidth, ganttDateStart } = get();

			const current = tasks.find((task) => task.id === id);

			if (!current) {
				throw new Error("No task found to update");
			}
			const offsetAtStartOfEndDate = offset - zoomGridWidth;
			let end = getDateFromOffset(ganttDateStart, offsetAtStartOfEndDate, zoomGridWidth, { startsAtZero: true });

			if (current.end === end) {
				return;
			}

			if (current.start && end <= current.start) {
				end = current.start;
			}

			setTask(id, { ...current, end });
		},

		setTaskDateStart: (id, offset) => {
			const { tasks, setTask, zoomGridWidth, ganttDateStart } = get();

			const current = tasks.find((task) => task.id === id);

			if (!current) {
				throw new Error("No task found to update");
			}

			let start = getDateFromOffset(ganttDateStart, offset, zoomGridWidth, { startsAtZero: true });

			if (current.start === start) {
				return;
			}

			if (current.end && start >= current.end) {
				start = current.end;
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

		zoomUpdate: (zoomLevel, currentLeft, ganttWidth) => {
			if (currentLeft === undefined || ganttWidth === undefined) {
				throw new Error("ScrollLeft and offsetWidth must be defined");
			}

			const { zoom: currentZoom, ganttDateStart } = get();

			const currentWidth = TIMELINE_CONFIG[currentZoom].gridWidth;
			const currentCenter = currentLeft + ganttWidth / 2 - currentWidth;

			const nextDate = getDateFromOffset(ganttDateStart, currentCenter, currentWidth, { startsAtZero: false });
			const nextWidth = TIMELINE_CONFIG[zoomLevel].gridWidth;
			const nextPadding = TIMELINE_CONFIG[zoomLevel].monthsPadding;

			set({
				zoom: zoomLevel,
				zoomGridWidth: nextWidth,
				ganttDateCentered: Object.freeze(nextDate),
				ganttDateEnd: Object.freeze(add(nextDate, { months: nextPadding })),
				ganttDateStart: Object.freeze(startOfMonth(sub(nextDate, { months: nextPadding }))),
			});
		},
	}));
};
