import { GanttProvider } from "../store/GanttProvider";
import { Wrapper } from "./Wrapper";

function Gantt() {
	return (
		<GanttProvider>
			<Wrapper />
		</GanttProvider>
	);
}

export default Gantt;
