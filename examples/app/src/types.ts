export type ITask = {
	id: string;
	creating: boolean;
	title: string;
	start: string;
	end: string;
};

export type ITaskOffset = { x: number; width: number };

export type ITaskViewportPosition = {
	top: number;
	left: number;
	right: number;
	overflowLeft: boolean;
	overflowRight: boolean;
	gone?: boolean;
};
