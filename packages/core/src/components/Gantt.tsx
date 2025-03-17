import { GanttProvider } from "../store/GanttProvider";
import { GanttContainer } from "./GanttContainer";

export type GanttProps = {
	dateCentered: any;
	tasks: any;
};

export const Gantt = (props: GanttProps) => {
	const { dateCentered, tasks } = props;

	return (
		<GanttProvider dateCentered={dateCentered} tasks={tasks}>
			<GanttContainer />
		</GanttProvider>
	);
};
