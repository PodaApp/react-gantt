import { RefObject, useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { format, isToday } from "date-fns";

import cevronsRight from "../assets/chevrons-right.svg";
import { GanttData, useCalendar } from "../hooks/useCalendar";
import { ITask } from "../types";
import "./Header.css";
import { HeaderRange } from "./HeaderRange";

type Props = {
	focusedTask: ITask | null;
	containerRef: RefObject<HTMLDivElement>;
};

export const Header = ({ focusedTask: activeTask, containerRef }: Props) => {
	const calendar: GanttData = useCalendar();
	// TODO: Dodgy default
	const [firstMonth, setFirstMonth] = useState<string | null>("January 2025");

	const elsMonth = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		const headerCallback: IntersectionObserverCallback = (entries) => {
			entries.forEach((entry) => {
				if (entry.boundingClientRect.x < 0 && entry.intersectionRatio <= 0) {
					setFirstMonth(entry.target.getAttribute("data-next"));
				} else if (entry.boundingClientRect.x < 0 && entry.intersectionRatio > 0) {
					setFirstMonth(entry.target.getAttribute("data-current"));
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
	}, [containerRef]);

	return (
		<>
			<div className="headerSticky">
				<div className="headerSticky__month header__month">
					<img src={cevronsRight} /> {firstMonth}
				</div>
			</div>
			<div className="header" ref={containerRef}>
				{activeTask && <HeaderRange node={activeTask} />}
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
									const inRange = activeTask && day >= new Date(activeTask.start) && day <= new Date(activeTask.end);
									const isStart = activeTask && day.toDateString() === new Date(activeTask.start).toDateString();
									const isEnd = activeTask && day.toDateString() === new Date(activeTask.end).toDateString();

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
