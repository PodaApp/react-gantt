import { RefObject, useEffect, useState } from "react";

import { ITask, ITaskPosition } from "../types";
import { Task, TaskOnHover } from "./Task";
import "./Tasks.css";
import { Today } from "./Today";
import { Weekends } from "./Weekends";

type OffscreenTasks = Record<string, ITaskPosition>;

type Props = {
	startDate: number; //TODO: Temp use context
	tasks: ITask[];
	onTaskHover: TaskOnHover;
	containerRef: RefObject<HTMLDivElement>;
};

export const Tasks = ({ startDate, tasks, onTaskHover, containerRef }: Props) => {
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
	}, [startDate, containerRef]);

	return (
		<div className="tasks">
			{tasks.map((task) => (
				<Task
					ganttStartDate={startDate}
					data={task}
					key={task.id}
					stickyPosition={taskPositions[task.id]}
					containerRef={containerRef}
					onHover={onTaskHover}
				/>
			))}
			<Today ganttStartDate={startDate} />
			<Weekends />
		</div>
	);
};
