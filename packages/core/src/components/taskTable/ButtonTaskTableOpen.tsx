import { useCallback } from "react";

import classNames from "classnames";

import { useGanttStore } from "../../store/ganttStore";
import { ChevronsRight } from "../icons/ChevronsRight";

import "./ButtonTaskTableOpen.css";

type Props = {
	hide: "onOpen" | "onClose";
};

export const ButtonTaskTableOpen = ({ hide }: Props) => {
	const isOpen = useGanttStore.use.ganttTaskListOpen();
	const setOpen = useGanttStore.use.setGanttTaskListOpen();

	const handleClick = useCallback(() => {
		setOpen(!isOpen);
	}, [isOpen, setOpen]);

	const actionClassname = classNames("buttonTaskTableOpen", {
		"buttonTaskTableOpen--open": isOpen,
	});

	if ((isOpen && hide === "onOpen") || (!isOpen && hide === "onClose")) {
		return null;
	}

	return (
		<button className={actionClassname} onClick={handleClick}>
			<ChevronsRight />
		</button>
	);
};
