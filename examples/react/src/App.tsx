import { Gantt } from "@nikglavin/react-gantt";

import "./App.css";
import "@nikglavin/react-gantt/style.css";

function App() {
	const tasks = [
		{
			id: "0",
			title: "More CMS Block Types",
			start: new Date(2025, 2, 10),
			end: new Date(2025, 2, 14),
			creating: false,
		},
		{
			id: "1",
			title: "Setup Github Actions",
			start: new Date(2025, 1, 1),
			end: new Date(2025, 1, 24),
			creating: false,
		},
		{
			id: "2",
			title: "Automated RTS Management",
			start: new Date(2025, 1, 1),
			end: new Date(2025, 3, 14),
			creating: false,
		},
		{ id: "3", title: "Task no date", start: null, end: null, creating: false },
	];

	return <Gantt tasks={tasks} />;
}

export default App;
