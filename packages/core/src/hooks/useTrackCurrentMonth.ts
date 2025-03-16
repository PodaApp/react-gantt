import { RefObject, useEffect } from "react";

import { useGanttStore } from "./useGanttStore";

export const useTrackCurrentMonth = (containerRef: RefObject<HTMLDivElement>) => {
	const setHeaderMonth = useGanttStore((state) => state.setHeaderMonth);
	const ganttDateStart = useGanttStore((state) => state.ganttDateStart);
	const ganttDateEnd = useGanttStore((state) => state.ganttDateEnd);

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

		const elements = Array.from(containerRef.current.querySelectorAll("[data-observer]"));
		elements?.forEach((el) => observer.observe(el));

		return () => {
			elements?.forEach((el) => observer.unobserve(el));
			observer.disconnect();
		};
	}, [containerRef, setHeaderMonth, ganttDateStart, ganttDateEnd]);
};
