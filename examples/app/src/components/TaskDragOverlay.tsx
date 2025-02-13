import { DragOverlay } from "@dnd-kit/core";

import { ITask } from "../types";
import { getTaskPosition } from "../utils/getTaskPosition";
import { isTaskWithDate } from "../utils/isTaskWithDate";
import { TaskStatic } from "./TaskStatic";

type Props = {
	task: ITask | null;
	dateStart: Date;
};

export const TaskDragOverlay = ({ task, dateStart }: Props) => {
	if (!isTaskWithDate(task)) {
		return;
	}

	const position = task ? getTaskPosition(dateStart, task) : undefined;
	const showOverlay = task && position;

	return (
		<DragOverlay dropAnimation={null}>
			{showOverlay && (
				<div style={{ width: `${position?.width}px`, transform: `translateX(${position?.x}px)` }}>
					<TaskStatic task={task} showBeacons={false} />
				</div>
			)}
		</DragOverlay>
	);
};
