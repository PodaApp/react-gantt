import { GanttProvider } from "../store/GanttProvider";
import { GanttProps } from "../types/componentProps";
import { ITask } from "../types/tasks";
import { GanttContainer } from "./GanttContainer";
import { StoreUpdater } from "./StoreUpdater";

export const Gantt = <TaskType extends ITask = ITask>(props: GanttProps<TaskType>) => {
	const { dateFormatLong, dateFormatShort, tasks, timelineDateCentered, timelineJumpToPaddingDays, timelineZoomConfig } = props;

	return (
		<GanttProvider
			timelineDateCentered={timelineDateCentered}
			tasks={tasks}
			timelineZoomConfig={timelineZoomConfig}
			timelineJumpToPaddingDays={timelineJumpToPaddingDays}
			dateFormatLong={dateFormatLong}
			dateFormatShort={dateFormatShort}>
			<StoreUpdater {...props}>
				<GanttContainer />
			</StoreUpdater>
		</GanttProvider>
	);
};
