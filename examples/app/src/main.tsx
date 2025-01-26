import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import Gantt from "./Gantt.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Gantt />
	</StrictMode>,
);
