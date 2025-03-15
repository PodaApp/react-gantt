import { startOfDay } from "date-fns";

import { ITask } from "../types";

// I need to strip all time and timezones from dates...

export const tasks: ITask[] = [
	{
		id: "0",
		title: "More CMS Block Types",
		start: startOfDay(new Date("2025-03-10")),
		end: startOfDay(new Date("2025-03-14")),
		creating: false,
	},
	{
		id: "1",
		title: "Setup Github Actions",
		start: startOfDay(new Date("2025-02-01")),
		end: startOfDay(new Date("2025-02-24")),
		creating: false,
	},
	{
		id: "2",
		title: "Automated RTS Management",
		start: startOfDay(new Date("2025-02-01")),
		end: startOfDay(new Date("2025-04-14")),
		creating: false,
	},
	{ id: "3", title: "Task no date", start: null, end: null, creating: false },
];
