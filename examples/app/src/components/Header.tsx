import { RefObject, useEffect, useRef } from "react";

import classNames from "classnames";
import { format, isToday } from "date-fns";

import { useCalendar } from "../hooks/useCalendar";
import { useGanttStore } from "../store/ganttStore";
import "./Header.css";
import { HeaderRange } from "./HeaderRange";
import { HeaderSticky } from "./HeaderSticky";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const Header = ({ containerRef }: Props) => {
	const elsMonth = useRef<(HTMLDivElement | null)[]>([]);

	const setHeaderMonth = useGanttStore.use.setHeaderMonth();

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

	return (
		<>
			<HeaderSticky />
			<div className="header" ref={containerRef}>
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
								{month.weeks.map((dayOfTheWeek) => {
									const day = new Date(dayOfTheWeek);
									const today = isToday(day);

									const rootClass = classNames({
										header__day: true,
										"header__day--today": today,
									});

									return (
										<div className={rootClass} key={`week-${dayOfTheWeek}`}>
											{today ? <div className="header__today" /> : null}
											{format(dayOfTheWeek, "d")}
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
