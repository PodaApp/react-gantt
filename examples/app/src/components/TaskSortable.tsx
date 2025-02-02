import { CSSProperties, ReactNode, RefObject } from "react";

import { useSortable } from "@dnd-kit/sortable";
import classNames from "classnames";
import { createPortal } from "react-dom";

import { ITask } from "../types";
import "./TaskSortable.css";

type Props = {
	task: ITask;
	activeIndex: number;
	children: ReactNode;
	parentRef: RefObject<HTMLDivElement>;
};

export const TaskSortable: React.FC<Props> = ({ task, activeIndex, children, parentRef }) => {
	const { attributes, listeners, index, over, setNodeRef, isDragging } = useSortable({ id: task.id, data: task });

	// TODO: Consider passing this as a prop rather than active index to avoid duplicate logic
	const markerPosition = over?.id === task.id ? (index > activeIndex ? "after" : "before") : undefined;

	const style: CSSProperties = {
		width: "100%",
		visibility: isDragging ? "hidden" : "visible",
	};

	const markerClassName = classNames({
		taskSortable__marker: true,
		"taskSortable__marker--after": markerPosition === "after",
		"taskSortable__marker--before": markerPosition === "before",
	});

	if (!parentRef.current) return null;

	return (
		<>
			<div style={style} {...attributes} {...listeners} ref={setNodeRef}>
				{children}
			</div>
			{createPortal(<div className={markerClassName} />, parentRef.current)}
		</>
	);
};
