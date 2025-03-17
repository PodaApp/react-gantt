import { startOfDay } from "date-fns";

import { ITask } from "../../../packages/core/src/types";

// I need to strip all time and timezones from dates...

export const tasksSingle: ITask[] = [
	{
		id: "0",
		title: "More CMS Block Types",
		start: startOfDay(new Date("2024-12-30")),
		end: startOfDay(new Date("2025-01-03")),
		creating: false,
	},
];

export const tasksWithUnscheduled: ITask[] = [
	{
		id: "0",
		title: "More CMS Block Types",
		start: startOfDay(new Date("2024-12-30")),
		end: startOfDay(new Date("2025-01-03")),
		creating: false,
	},
	{
		id: "1",
		title: "Setup Github Actions",
		start: startOfDay(new Date("2025-01-06")),
		end: startOfDay(new Date("2025-01-10")),
		creating: false,
	},
	{
		id: "2",
		title: "Automated RTS Management",
		start: startOfDay(new Date("2025-01-13")),
		end: startOfDay(new Date("2025-01-24")),
		creating: false,
	},
	{ id: "3", title: "Task no date", start: null, end: null, creating: false },
];
