import { useCallback } from "react";

import IconPlus from "../assets/plus.svg?react";
import { useGanttStore } from "../store/ganttStore";
import "./ButtonTaskNew.css";

type Props = {
	hide: "onOpen" | "onClose";
};

export const ButtonTaskNew = ({ hide }: Props) => {
	const index = useGanttStore((state) => state.tasks.length);

	const isOpen = useGanttStore.use.taskTableOpen();
	const createTaskAtIndex = useGanttStore.use.createTaskAtIndex();

	// Index here is inclusive as its based on tasks.length
	const handleClick = useCallback(() => {
		createTaskAtIndex(index);
	}, [createTaskAtIndex, index]);

	if ((isOpen && hide === "onOpen") || (!isOpen && hide === "onClose")) {
		return null;
	}

	return (
		<div className="buttonTaskNew" onClick={handleClick}>
			<IconPlus /> New
		</div>
	);
};
