export type ITask = {
	id: string;
	creating: boolean;
	title: string;
	start: Date | null;
	end: Date | null;
};

export type ITaskWithDate = ITask & {
	start: Date;
	end: Date;
};

export type ITaskOffset = { x: number; duration: number; width: number };

export type ITaskViewportPosition = {
	top: number;
	left: number;
	right: number;
	overflowLeft: boolean;
	overflowRight: boolean;
	gone?: boolean;
};
