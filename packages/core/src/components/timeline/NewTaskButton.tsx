import { useCallback } from "react";

import { useGanttStore } from "../../hooks/useGanttStore";
import { Plus } from "../icons/Plus";

import "./NewTaskButton.css";

type Props = {
	hide: "onOpen" | "onClose";
};

export const NewTaskButton = ({ hide }: Props) => {
	const isOpen = useGanttStore((state) => state.ganttTaskListOpen);
	const createTaskAtEnd = useGanttStore((state) => state.taskCreateAtEnd);

	const handleClick = useCallback(() => {
		createTaskAtEnd();
	}, [createTaskAtEnd]);

	if ((isOpen && hide === "onOpen") || (!isOpen && hide === "onClose")) {
		return null;
	}

	return (
		<div className="newTaskButton" onClick={handleClick}>
			<Plus /> New
		</div>
	);
};
