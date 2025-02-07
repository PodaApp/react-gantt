import { useCallback } from "react";

import classNames from "classnames";

import IconChevronsRight from "../assets/chevrons-right.svg?react";
import { useGanttStore } from "../store/ganttStore";
import "./HeaderActionOpenTable.css";

type Props = {
	hide: "onOpen" | "onClose";
};

export const HeaderActionOpenTable = ({ hide }: Props) => {
	const isOpen = useGanttStore.use.taskTableOpen();
	const setOpen = useGanttStore.use.setTaskTableOpen();

	const handleClick = useCallback(() => {
		setOpen(!isOpen);
	}, [isOpen, setOpen]);

	const actionClassname = classNames("headerActionOpenTable action", {
		"headerActionOpenTable--open": isOpen,
	});

	if ((isOpen && hide === "onOpen") || (!isOpen && hide === "onClose")) {
		return null;
	}

	return (
		<button className={actionClassname} onClick={handleClick}>
			<IconChevronsRight />
		</button>
	);
};
