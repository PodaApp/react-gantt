export const GRID_WIDTH = 40;
export const GRID_HEIGHT = 30;

export const GANTT_NEW_TASK_SIZE_DAYS = 5;
export const GANTT_SNAP_LEFT_MIN = 0.66;

export const GANTT_JUMP_TO_TASK_PADDING_DAYS = 5;

export const DATE_FORMAT_SHORT_MONTH = "MMM dd, yyyy";
export const DATE_FORMAT_SHORT_MONTH_NO_YEAR = "MMM dd";

export const DRAG_SENSOR_CONFIG = {
	activationConstraint: {
		distance: 5,
	},
};

export const TASK_ID_UNCOMMITED = "scheduling";

type TimelineComponents = "weekends" | "firstOfMonth";
type TimelineConfig = {
	gridWidth: number;
	monthsPadding: number;
	components: TimelineComponents[];
	headerScale: string;
};

export const DEFAULT_ZOOM: TimelineZoomLevels = "week";

export type TimelineZoomLevels = "year" | "quarter" | "month" | "week";

export const TIMELINE_CONFIG: Record<TimelineZoomLevels, TimelineConfig> = {
	week: { gridWidth: 40, monthsPadding: 6, components: ["weekends"], headerScale: "days" },
	month: { gridWidth: 20, monthsPadding: 12, components: ["firstOfMonth"], headerScale: "weeks" },
	quarter: { gridWidth: 12, monthsPadding: 29, components: ["firstOfMonth"], headerScale: "weeks" },
	year: { gridWidth: 5, monthsPadding: 48, components: ["firstOfMonth"], headerScale: "weeks" },
};
