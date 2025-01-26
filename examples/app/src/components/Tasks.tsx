import { RefObject, useEffect, useState } from "react";

import { ITask, ITaskPosition } from "../types";
import { Task } from "./Task";
import "./Tasks.css";
import { Today } from "./Today";
import { Weekend } from "./Weekend";

type OffscreenTasks = Record<string, ITaskPosition>;

const weekends = [
	3, 10, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80, 87, 94, 101, 108, 115, 122, 129, 136, 143, 150, 157, 164, 171, 178, 185, 192, 199, 206, 213, 220,
	227, 234, 241, 248, 255, 262, 269, 276, 283, 290, 297, 304, 311, 318, 325, 332, 339, 346, 353, 360,
];

type Props = {
	tasks: ITask[];
	onTaskHover: (task: ITask) => void;
	containerRef: RefObject<HTMLDivElement>;
};

export const Tasks = ({ tasks, onTaskHover, containerRef }: Props) => {
	const [taskPositions, setOffscreenTasks] = useState<OffscreenTasks>({});

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

				const updateTaskById =
					(taskId: string, options: Partial<ITaskPosition>) =>
					({ [taskId]: current, ...rest }) => ({
						...rest,
						[taskId]: { ...current, top: entry.boundingClientRect.top, left: containerLeftEdge, right: containerRightEdge, ...options },
					});

				// The left has an additional state where the task text remains visible when the start of the
				// task is not within the view port. The text must also appear when the end of the tasks
				// appears within the view port.

				if (enterLeftStart) {
					setOffscreenTasks(updateTaskById(id, { overflowLeft: false }));
				} else if (exitLeftEnd) {
					setOffscreenTasks(updateTaskById(id, { overflowLeft: true, gone: true }));
				} else if (exitLeftStart) {
					setOffscreenTasks(updateTaskById(id, { overflowLeft: true, gone: false }));
				} else if (enterLeftEnd) {
					setOffscreenTasks(updateTaskById(id, { gone: false }));
				}

				if (exitRightEnd || exitRightStart) {
					setOffscreenTasks(updateTaskById(id, { overflowRight: true }));
				} else if (enterRightEnd) {
					setOffscreenTasks(updateTaskById(id, { overflowRight: false }));
				}
			});
		};

		const observeTasks = new IntersectionObserver(onTaskIntersection, {
			root: containerRef.current,
			threshold: [0, 1],
			rootMargin: "4px",
		});

		// TODO: Decouple dependancy on class name
		const observeTasksElements = containerRef.current?.querySelectorAll(".task__beacon");
		observeTasksElements?.forEach((el) => observeTasks.observe(el));

		return () => {
			// Cleanup observers
			observeTasksElements?.forEach((el) => {
				observeTasks.unobserve(el);
			});
		};
	}, [containerRef]);

	return (
		<div className="tasks" ref={containerRef}>
			{tasks.map((task) => (
				<Task data={task} key={task.id} sticky={taskPositions[task.id]} onHover={onTaskHover} />
			))}
			<Today />
			{weekends.map((daysOffset) => (
				<Weekend key={daysOffset} daysOffset={daysOffset} />
			))}
		</div>
	);
};
