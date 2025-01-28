import cevronsRight from "../assets/chevrons-right.svg";
import { useGanttStore } from "../store/ganttStore";
import "./HeaderSticky.css";

export const HeaderSticky = () => {
	const currentMonth = useGanttStore.use.headerMonth();
	return (
		<div className="headerSticky">
			<div className="headerSticky__month header__month">
				<img src={cevronsRight} /> {currentMonth}
			</div>
		</div>
	);
};
