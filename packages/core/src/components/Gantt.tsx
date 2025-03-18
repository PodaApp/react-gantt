import { GanttProvider } from "../store/GanttProvider";
import { ITask } from "../types";
import { GanttContainer } from "./GanttContainer";

export type GanttProps = {
	tasks: ITask[];
	dateCentered?: Date;
};

export const Gantt = (props: GanttProps) => {
	const { dateCentered, tasks } = props;

	return (
		<GanttProvider dateCentered={dateCentered} tasks={tasks}>
			<GanttContainer />
		</GanttProvider>
	);
};
