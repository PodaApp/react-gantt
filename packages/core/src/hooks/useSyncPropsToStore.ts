import { useEffect, useRef } from "react";

import { GanttProps } from "../types/componentProps";
import { ITask } from "../types/tasks";
import { useGanttStore } from "./useGanttStore";
import { useStoreApi } from "./useStoreApi";

const propsToSync: (keyof GanttProps)[] = [
	"dateFormatLong",
	"dateFormatShort",
	"timelineZoomConfig",
	"timelineJumpToPaddingDays",
	"timelineDateCentered",
	"tasks",
	"onTaskClick",
	"onTaskContextClick",
	"onTaskDrag",
	"onTaskDragEnd",
	"onTaskDragStart",
	"onTaskMouseEnter",
	"onTaskMouseLeave",
	"onTasksChange",
	"onTimelineChange",
];

export const useSyncPropsToStore = <TaskType extends ITask>(props: Partial<GanttProps<TaskType>>) => {
	const { setState } = useStoreApi();
	const setTasks = useGanttStore((state) => state.setTasks);

	const previousProps = useRef<Partial<GanttProps<TaskType>>>();

	useEffect(
		() => {
			console.count();
			for (const key of propsToSync) {
				if (previousProps.current && previousProps.current[key] === props[key]) {
					continue;
				}

				if (props[key] === undefined) {
					continue;
				}

				switch (key) {
					case "tasks": {
						setTasks(props[key]);
						break;
					}
					default: {
						setState({ [key]: props[key] });
						break;
					}
				}
			}
			previousProps.current = props;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		propsToSync.map((propName) => props[propName]),
	);

	return null;
};
