export type ITask = {
	id: string;
	title: string;
	start: string;
	end: string;
	focused: boolean;
};

export type ITaskPosition = { top: number; left: number; right: number; overflowLeft: boolean; overflowRight: boolean; gone?: boolean };
