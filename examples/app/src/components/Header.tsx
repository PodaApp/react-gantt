import { RefObject, useLayoutEffect, useRef, useState } from "react";

import classNames from "classnames";
import { format, isToday } from "date-fns";

import cevronsRight from "../assets/chevrons-right.svg";
import { GanttData, useCalendar } from "../hooks/useCalendar";
import { ITask } from "../types";
import "./Header.css";
import { HeaderRange } from "./HeaderRange";

type Props = {
	startDate: number;
	endDate: number;
	focusedTask: ITask | null;
	containerRef: RefObject<HTMLDivElement>;
};

export const Header = ({ startDate, endDate, focusedTask, containerRef }: Props) => {
	const calendar: GanttData = useCalendar({ startDate, endDate });

	// TODO: Dodgy default
	const [monthCurrent, setMonthCurrent] = useState<string | null>("January 2025");

	const elsMonth = useRef<(HTMLDivElement | null)[]>([]);

	useLayoutEffect(() => {
		const headerCallback: IntersectionObserverCallback = (entries) => {
			entries.forEach((entry) => {
				if (entry.boundingClientRect.x < 0 && entry.intersectionRatio <= 0) {
					setMonthCurrent(entry.target.getAttribute("data-next"));
				} else if (entry.boundingClientRect.x < 0 && entry.intersectionRatio > 0) {
					setMonthCurrent(entry.target.getAttribute("data-current"));
				}
			});
		};

		const observeHeader = new IntersectionObserver(headerCallback, {
			root: containerRef.current,
			threshold: 0,
		});

		const observeHeaderElements = containerRef.current?.querySelectorAll(".header__block");
		observeHeaderElements?.forEach((el) => observeHeader.observe(el));

		return () => {
			// Cleanup observers
			observeHeaderElements?.forEach((el) => observeHeader.unobserve(el));
		};
		// TODO: Props required as dependancy else not all elements are observed
	}, [startDate, containerRef]);

	return (
		<>
			<div className="headerSticky">
				<div className="headerSticky__month header__month">
					<img src={cevronsRight} /> {monthCurrent}
				</div>
			</div>
			<div className="header" ref={containerRef}>
				{focusedTask && <HeaderRange node={focusedTask} />}
				{calendar.map((month, index) => {
					// TODO: This should be a type error possibly undefined;
					const nextMonth = calendar[index + 1] || calendar[index];

					return (
						<div
							className="header__block"
							data-current={`${month.month} ${month.year}`}
							data-next={`${nextMonth.month} ${month.year}`}
							key={`${month.year}-${month.month}`}>
							<div className="header__month" ref={(el) => (elsMonth.current[index] = el)}>
								{month.month}
							</div>
							<div className="header__week">
								{month.weeks.map((week) => {
									const day = new Date(week);

									const today = isToday(day);
									const inRange = focusedTask && day >= new Date(focusedTask.start) && day <= new Date(focusedTask.end);
									const isStart = focusedTask && day.toDateString() === new Date(focusedTask.start).toDateString();
									const isEnd = focusedTask && day.toDateString() === new Date(focusedTask.end).toDateString();

									const rootClass = classNames({
										header__day: true,
										"header__day--bold": today,
										"header__day--range": inRange,
										"header__day--range-start": isStart,
										"header__day--range-end": isEnd,
									});

									return (
										<div className={rootClass} key={`week-${week}`}>
											{today ? <div className="header__today" /> : null}
											{format(week, "d")}
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
