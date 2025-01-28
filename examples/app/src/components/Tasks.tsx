import { RefObject, useEffect } from "react";

import { useGanttStore } from "../store/ganttStore";
import { Task } from "./Task";
import "./Tasks.css";
import { Today } from "./Today";
import { Weekends } from "./Weekends";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

export const Tasks = ({ containerRef }: Props) => {
	const setOffscreenTasks = useGanttStore.use.setTaskPositions();

	const tasks = useGanttStore.use.tasks();

	useEffect(() => {
		const onTaskIntersection: IntersectionObserverCallback = (entries) => {
			entries.forEach((entry) => {
				const id = entry.target.getAttribute("data-id");
				const position = entry.target.getAttribute("data-position");
				const root = entry.rootBounds;

				if (!id) {
					throw new Error("Task missing data-id attribute");
				}

				if (!position) {
					throw new Error("Task missing data-position attribute");
				}

				if (!root) {
					throw new Error("Can't read root container");
				}

				// Can be left, right or x, beacons have 0 width and are used at the start and the end of
				// Timeline tasks as observing the element itself failes for the case where the task exceeds
				// the width of the root element

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

				const currentPosition = { top: entry.boundingClientRect.top, left: containerLeftEdge, right: containerRightEdge };

				// The left has an additional state where the task text remains visible when the start of the
				// task is not within the view port. The text must also appear when the end of the tasks
				// appears within the view port.

				if (enterLeftStart) {
					setOffscreenTasks(id, { ...currentPosition, overflowLeft: false });
				} else if (exitLeftEnd) {
					setOffscreenTasks(id, { ...currentPosition, overflowLeft: true, gone: true });
				} else if (exitLeftStart) {
					setOffscreenTasks(id, { ...currentPosition, overflowLeft: true, gone: false });
				} else if (enterLeftEnd) {
					setOffscreenTasks(id, { ...currentPosition, gone: false });
				}

				if (exitRightEnd || exitRightStart) {
					setOffscreenTasks(id, { ...currentPosition, overflowRight: true });
				} else if (enterRightEnd) {
					setOffscreenTasks(id, { ...currentPosition, overflowRight: false });
				}
			});
		};

		const observeTasks = new IntersectionObserver(onTaskIntersection, {
			root: containerRef.current,
			threshold: [0, 1],
			rootMargin: "4px",
		});

		// TODO: Decouple dependancy on class name, tasks should store a reference to the node
		// as its requried for this to work anyway
		const observeTasksElements = containerRef.current?.querySelectorAll(".task__beacon");
		observeTasksElements?.forEach((el) => observeTasks.observe(el));

		return () => {
			// Cleanup observers
			observeTasksElements?.forEach((el) => {
				observeTasks.unobserve(el);
			});
		};
	}, [tasks, containerRef, setOffscreenTasks]);

	return (
		<div className="tasks">
			{tasks.map((task) => (
				<Task task={task} containerRef={containerRef} key={task.id} />
			))}
			<Today />
			<Weekends />
		</div>
	);
};
