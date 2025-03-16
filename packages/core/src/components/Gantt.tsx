import { GanttProvider } from "../store/GanttProvider";
import { GanttContainer } from "./GanttContainer";

function Gantt() {
	return (
		<GanttProvider>
			<GanttContainer />
		</GanttProvider>
	);
}

export default Gantt;
