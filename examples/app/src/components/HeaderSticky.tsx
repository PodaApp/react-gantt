import { useGanttStore } from "../store/ganttStore";
import { ButtonTaskTableOpen } from "./ButtonTaskTableOpen";
import "./HeaderSticky.css";

export const HeaderSticky = () => {
	const currentMonth = useGanttStore.use.headerMonth();

	return (
		<div className="headerSticky">
			<ButtonTaskTableOpen hide="onOpen" />
			<div className="headerSticky__month header__month">{currentMonth}</div>
		</div>
	);
};
