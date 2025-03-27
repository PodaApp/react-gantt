export const GANTT_JUMP_TO_TASK_PADDING_DAYS = 5;

export const DATE_FORMAT_SHORT_MONTH = "MMM dd, yyyy";
export const DATE_FORMAT_SHORT_MONTH_NO_YEAR = "MMM dd";

export const DRAG_SENSOR_CONFIG = {
	activationConstraint: {
		distance: 5,
	},
};

export const TASK_ID_UNCOMMITTED = "scheduling";

type TimelineComponents = "weekends" | "firstOfMonth";
type TimelineConfig = {
	gridWidth: number;
	monthsPadding: number;
	components: TimelineComponents[];
	headerScale: string;
	defaultTaskSizeDays: number;
};

export const DEFAULT_ZOOM: TimelineZoomLevels = "week";

export type TimelineZoomLevels = "year" | "quarter" | "month" | "week";

export const TIMELINE_CONFIG: Record<TimelineZoomLevels, TimelineConfig> = {
	week: { gridWidth: 40, monthsPadding: 6, components: ["weekends"], headerScale: "days", defaultTaskSizeDays: 5 },
	month: { gridWidth: 20, monthsPadding: 12, components: ["firstOfMonth"], headerScale: "weeks", defaultTaskSizeDays: 14 },
	quarter: { gridWidth: 12, monthsPadding: 29, components: ["firstOfMonth"], headerScale: "weeks", defaultTaskSizeDays: 14 },
	year: { gridWidth: 5, monthsPadding: 48, components: ["firstOfMonth"], headerScale: "weeks", defaultTaskSizeDays: 28 },
};
