import { useGanttStore } from "../../store/ganttStore";
import { ButtonTaskTableOpen } from "../taskTable/ButtonTaskTableOpen";

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
