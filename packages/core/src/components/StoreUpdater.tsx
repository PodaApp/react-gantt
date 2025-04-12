import { useSyncPropsToStore } from "../hooks/useSyncPropsToStore";
import { GanttProps } from "../types/componentProps";
import { ITask } from "../types/tasks";

export const StoreUpdater = <TaskType extends ITask>({
	children,
	tasks,
	dateFormatLong,
	dateFormatShort,
	timelineDateCentered,
	timelineJumpToPaddingDays,
	timelineZoomConfig,
	onTaskClick,
	onTaskMouseEnter,
	onTaskMouseLeave,
	onTaskContextClick,
	onTaskDrag,
	onTaskDragStart,
	onTaskDragEnd,
	onTimelineChange,
	onTasksChange,
}: GanttProps<TaskType> & {
	children: React.ReactNode;
}) => {
	useSyncPropsToStore({
		tasks,
		dateFormatLong,
		dateFormatShort,
		timelineDateCentered,
		timelineJumpToPaddingDays,
		timelineZoomConfig,
		onTaskClick,
		onTaskMouseEnter,
		onTaskMouseLeave,
		onTaskContextClick,
		onTaskDrag,
		onTaskDragStart,
		onTaskDragEnd,
		onTimelineChange,
		onTasksChange,
	});

	return <>{children}</>;
};
