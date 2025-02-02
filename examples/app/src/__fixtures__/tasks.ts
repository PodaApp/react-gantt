import { ITask } from "../types";

export const tasks: ITask[] = [
	{ id: "0", title: "More CMS Block Types", start: new Date("2025-01-24").toISOString(), end: new Date("2025-02-12").toISOString(), creating: false },
	{ id: "1", title: "Sandbox Setup", start: new Date("2025-02-08").toISOString(), end: new Date("2025-02-24").toISOString(), creating: false },
	{
		id: "2",
		title: "Automated RTS Management",
		start: new Date("2025-02-22").toISOString(),
		end: new Date("2025-04-14").toISOString(),
		creating: false,
	},
];
