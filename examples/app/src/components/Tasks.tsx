import { RefObject, useEffect } from "react";

import { useGanttStore } from "../store/ganttStore";
import { ITaskViewportPosition } from "../types";
import { TaskNew } from "./TaskNew";
import "./Tasks.css";
import { TasksSortable } from "./TasksSortable";
import { Today } from "./Today";
import { Weekends } from "./Weekends";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const Tasks = ({ containerRef }: Props) => {
	const setOffscreenTasks = useGanttStore.use.setTaskPositions();

	const tasks = useGanttStore.use.tasks();

	// TODO: Move this into a hook
	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const handleIntersection: IntersectionObserverCallback = (entries) => {
			entries.forEach((entry) => {
				const id = entry.target.getAttribute("data-id");
				const position = entry.target.getAttribute("data-position");
				const root = entry.rootBounds;

				if (!id || !position || !root) {
					throw new Error(`Task missing required attributes: id=${id}, position=${position}, root=${root}`);
				}

				const beacon = entry.boundingClientRect.x;
				const containerLeftEdge = root.left;
				const containerRightEdge = root.right;

				const isInboundsLeft = beacon > containerLeftEdge;
				const isInboundsRight = beacon < containerRightEdge;

				const exitLeftStart = position === "start" && !isInboundsLeft;
				const exitLeftEnd = position === "end" && !isInboundsLeft;
				const enterLeftStart = position === "start" && isInboundsLeft;
				const enterLeftEnd = position === "end" && isInboundsLeft;

				const exitRightStart = position === "start" && !isInboundsRight;
				const exitRightEnd = position === "end" && !isInboundsRight;
				const enterRightEnd = position === "end" && isInboundsRight && isInboundsLeft;

				const currentPosition = {
					top: entry.boundingClientRect.top - entry.rootBounds.top,
					left: containerLeftEdge,
					right: containerRightEdge,
				};

				const calculatePostion = (options: Partial<ITaskViewportPosition>) => setOffscreenTasks(id, { ...currentPosition, ...options });

				if (enterLeftStart) {
					calculatePostion({ overflowLeft: false });
				} else if (exitLeftEnd) {
					calculatePostion({ overflowLeft: true, gone: true });
				} else if (exitLeftStart) {
					calculatePostion({ overflowLeft: true, gone: false });
				} else if (enterLeftEnd) {
					calculatePostion({ gone: false });
				}

				if (exitRightEnd || exitRightStart) {
					calculatePostion({ overflowRight: true });
				} else if (enterRightEnd) {
					calculatePostion({ overflowRight: false });
				}
			});
		};

		const observer = new IntersectionObserver(handleIntersection, {
			root: containerRef.current,
			threshold: [0, 1],
		});

		// TODO: Use refs
		const elements = Array.from(containerRef.current.querySelectorAll(".taskContent__beacon"));

		elements.forEach((element) => {
			observer.observe(element);
		});

		return () => {
			elements.forEach((el) => observer.unobserve(el));
			observer.disconnect();
		};
	}, [tasks, containerRef, setOffscreenTasks]);

	return (
		<div className="tasks">
			<TasksSortable tasks={tasks} containerRef={containerRef} />
			<Today />
			<Weekends />
			<div className="tasks__addNew">
				<TaskNew containerRef={containerRef} />
			</div>
		</div>
	);
};
