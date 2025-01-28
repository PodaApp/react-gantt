import { RefObject, useEffect, useRef } from "react";

import classNames from "classnames";
import { format, isToday } from "date-fns";

import { useCalendar } from "../hooks/useCalendar";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import "./Header.css";
import { HeaderRange } from "./HeaderRange";
import { HeaderSticky } from "./HeaderSticky";

type Props = {
	startDate: number;
	endDate: number;
	focusedTask: ITask | null;
	containerRef: RefObject<HTMLDivElement>;
};

export const Header = ({ startDate, endDate, focusedTask, containerRef }: Props) => {
	const elsMonth = useRef<(HTMLDivElement | null)[]>([]);

	const setHeaderMonth = useGanttStore.use.setHeaderMonth();

	const calendar = useCalendar({ startDate, endDate });

	useEffect(() => {
		const onHeaderIntersection: IntersectionObserverCallback = (entries) => {
			entries.forEach((entry) => {
				const root = entry.rootBounds;

				if (!root) {
					throw new Error("Can't read root container");
				}

				const beacon = entry.boundingClientRect.right;

				const containerLeftEdge = root.left;
				const conatinerRightEdge = root.right;

				const isInboundsLeft = beacon > containerLeftEdge;
				const isInboundsRight = beacon < conatinerRightEdge;

				const exitLeft = !isInboundsLeft;
				const enterLeft = isInboundsLeft && isInboundsRight;

				if (exitLeft) {
					setHeaderMonth(entry.target.getAttribute("data-next"));
				} else if (enterLeft) {
					setHeaderMonth(entry.target.getAttribute("data-current"));
				}
			});
		};

		const observeHeader = new IntersectionObserver(onHeaderIntersection, {
			root: containerRef.current,
			threshold: 0,
		});

		const observeHeaderElements = containerRef.current?.querySelectorAll(".header__block");
		observeHeaderElements?.forEach((el) => observeHeader.observe(el));

		return () => {
			observeHeaderElements?.forEach((el) => observeHeader.unobserve(el));
		};
		// TODO: Props required as dependancy else not all elements are observed
	}, [startDate, containerRef, setHeaderMonth]);

	return (
		<>
			<HeaderSticky />
			<div className="header" ref={containerRef}>
				{focusedTask && <HeaderRange node={focusedTask} />}
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
