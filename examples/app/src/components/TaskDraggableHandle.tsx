import { useDraggable } from "@dnd-kit/core";
import classNames from "classnames";
import { format } from "date-fns";

import { DATE_FORMAT_SHORT_MONTH_NO_YEAR } from "../constants";
import "./TaskDraggableHandle.css";

type Props = {
	taskId: string;
	date: string;
	direction: "left" | "right";
};

export const TaskDraggableHandle: React.FC<Props> = ({ taskId, date, direction }) => {
	const { attributes, listeners, isDragging, setNodeRef } = useDraggable({
		id: `${direction}.${taskId}`,
		data: {
			direction,
		},
	});

	const handleClass = classNames({
		taskDraggableHandle: true,
		"taskDraggableHandle--right": direction === "right",
		"taskDraggableHandle--dragging": isDragging,
	});

	const tooltipDate = format(date, DATE_FORMAT_SHORT_MONTH_NO_YEAR);

	return (
		<div className={handleClass} {...attributes} {...listeners} ref={setNodeRef}>
			<div className="taskDraggableHandle__tooltip">
				<div>{tooltipDate}</div>
			</div>
			<div className="taskDraggableHandle__handle" />
		</div>
	);
};
