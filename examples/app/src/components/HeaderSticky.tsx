import { useGanttStore } from "../store/ganttStore";
import { HeaderActionOpenTable } from "./HeaderActionOpenTable";
import "./HeaderSticky.css";

export const HeaderSticky = () => {
	const currentMonth = useGanttStore.use.headerMonth();
	return (
		<div className="headerSticky">
			<HeaderActionOpenTable hide="onOpen" />
			<div className="headerSticky__month header__month">{currentMonth}</div>
		</div>
	);
};
