import { ITask } from "../types";

export const tasks: ITask[] = [
	{ id: "0", title: "More CMS Block Types", start: new Date("2025-03-10"), end: new Date("2025-03-14"), creating: false },
	{ id: "1", title: "Sandbox Setup", start: new Date("2025-02-01"), end: new Date("2025-02-24"), creating: false },
	{
		id: "2",
		title: "Automated RTS Management",
		start: new Date("2025-02-01"),
		end: new Date("2025-04-14"),
		creating: false,
	},
	{ id: "3", title: "Task no date", start: null, end: null, creating: false },
];
