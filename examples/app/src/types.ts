export type ITask = {
	id: string;
	title: string;
	start: string;
	end: string;
};

export type ITaskPosition = { top: number; left: number; right: number; overflowLeft: boolean; overflowRight: boolean; gone?: boolean };
