import IconPlus from "../assets/plus.svg?react";
import { useGanttStore } from "../store/ganttStore";
import "./ButtonTaskTableNew.css";

type Props = {
	hide: "onOpen" | "onClose";
};

export const ButtonTaskNew = ({ hide }: Props) => {
	const isOpen = useGanttStore.use.taskTableOpen();

	if ((isOpen && hide === "onOpen") || (!isOpen && hide === "onClose")) {
		return null;
	}

	return (
		<div className="buttonTaskTableNew">
			<IconPlus /> New
		</div>
	);
};
