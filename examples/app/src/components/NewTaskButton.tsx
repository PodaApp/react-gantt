import { useCallback } from "react";

import IconPlus from "../assets/plus.svg?react";
import { useGanttStore } from "../store/ganttStore";
import "./NewTaskButton.css";

type Props = {
	hide: "onOpen" | "onClose";
};

export const NewTaskButton = ({ hide }: Props) => {
	const isOpen = useGanttStore.use.ganttTaskListOpen();
	const createTaskAtEnd = useGanttStore.use.taskCreateAtEnd();

	const handleClick = useCallback(() => {
		createTaskAtEnd();
	}, [createTaskAtEnd]);

	if ((isOpen && hide === "onOpen") || (!isOpen && hide === "onClose")) {
		return null;
	}

	return (
		<div className="newTaskButton" onClick={handleClick}>
			<IconPlus /> New
		</div>
	);
};
