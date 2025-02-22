import { RefObject, useRef } from "react";

import classNames from "classnames";
import { format } from "date-fns";

import { useCalendar } from "../hooks/useCalendar";
import { useTimelineConfig } from "../hooks/useTimelineConfig";
import { useTrackCurrentMonth } from "../hooks/useTrackCurrentMonth";
import { useGanttStore } from "../store/ganttStore";
import "./Header.css";
import { HeaderActions } from "./HeaderActions";
import { HeaderRange } from "./HeaderRange";
import { HeaderSticky } from "./HeaderSticky";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const Header = ({ containerRef }: Props) => {
	useTrackCurrentMonth(containerRef);

	const elsMonth = useRef<(HTMLDivElement | null)[]>([]);
	const { showAllDays } = useTimelineConfig();
	const gridWidth = useGanttStore.use.zoomGridWidth();
	const calendar = useCalendar();

	const timelineStyles = {
		"--grid-width": `${gridWidth}px`,
	} as React.CSSProperties;

	return (
		<>
			<HeaderSticky />
			<HeaderActions containerRef={containerRef} />
			<div className="header" style={timelineStyles} ref={containerRef}>
				<HeaderRange />
				{calendar.map((month, index) => {
					const nextMonth = calendar[index + 1] || month;

					return (
						<div
							className="header__block"
							data-observer
							data-current={`${month.month} ${month.year}`}
							data-next={`${nextMonth.month} ${nextMonth.year}`}
							key={`${month.month} ${month.year}`}>
							<div className="header__month" ref={(el) => (elsMonth.current[index] = el)}>
								{month.month}
							</div>
							<div className="header__week">
								{month.weeks.map((dayOfTheWeek, dayIndex) => {
									const showDate = showAllDays || month.mondays.includes(dayIndex);

									const rootClass = classNames({
										header__day: true,
									});

									const dateStyle = {
										"--date-x": `${dayIndex * gridWidth + gridWidth / 2}px`,
									} as React.CSSProperties;

									return (
										<div className={rootClass} key={`week-${dayOfTheWeek}`}>
											{showDate && (
												<div className="header__date" style={dateStyle}>
													{format(dayOfTheWeek, "d")}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
};
