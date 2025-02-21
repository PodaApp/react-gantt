import { RefObject, useEffect, useRef } from "react";

import classNames from "classnames";
import { format } from "date-fns";

import { useCalendar } from "../hooks/useCalendar";
import { useTimelineConfig } from "../hooks/useTimelineConfig";
import { useGanttStore } from "../store/ganttStore";
import "./Header.css";
import { HeaderRange } from "./HeaderRange";
import { HeaderSticky } from "./HeaderSticky";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const Header = ({ containerRef }: Props) => {
	const elsMonth = useRef<(HTMLDivElement | null)[]>([]);

	const { showAllDays } = useTimelineConfig();

	const setHeaderMonth = useGanttStore.use.setHeaderMonth();
	const gridWidth = useGanttStore.use.zoomGridWidth();

	const calendar = useCalendar();

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const onHeaderIntersection: IntersectionObserverCallback = (entries) => {
			let currentMonth: string | null = null;

			entries.forEach((entry) => {
				const root = entry.rootBounds;

				if (!root) {
					throw new Error("Can't read root container");
				}

				const headerRight = entry.boundingClientRect.right;
				const headerLeft = entry.boundingClientRect.left;

				const containerLeftEdge = root.left;
				const conatinerRightEdge = root.right;

				const isInboundsLeft = headerRight > containerLeftEdge;
				const isInboundsRight = headerRight < conatinerRightEdge;

				const exitLeft = !isInboundsLeft;
				const enterLeft = headerLeft < containerLeftEdge && isInboundsLeft && isInboundsRight;

				if (exitLeft) {
					currentMonth = entry.target.getAttribute("data-next");
				} else if (enterLeft) {
					currentMonth = entry.target.getAttribute("data-current");
				}
			});

			if (currentMonth) {
				setHeaderMonth(currentMonth);
			}
		};

		const observer = new IntersectionObserver(onHeaderIntersection, {
			root: containerRef.current,
			threshold: 0,
		});

		// TODO: use refs
		const elements = Array.from(containerRef.current.querySelectorAll(".header__block"));
		elements?.forEach((el) => observer.observe(el));

		return () => {
			elements?.forEach((el) => observer.unobserve(el));
			observer.disconnect();
		};
	}, [containerRef, setHeaderMonth]);

	const timelineStyles = {
		"--grid-width": `${gridWidth}px`,
	} as React.CSSProperties;

	return (
		<>
			<HeaderSticky />
			<div className="header" style={timelineStyles} ref={containerRef}>
				<HeaderRange />
				{calendar.map((month, index) => {
					const nextMonth = calendar[index + 1] || month;

					return (
						<div
							className="header__block"
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
