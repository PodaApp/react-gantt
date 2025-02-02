import { RefObject, useRef } from "react";

import { differenceInDays } from "date-fns";

import { COL_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import "./Task.css";
import { TaskContent } from "./TaskContent";
import { TaskDraggable } from "./TaskDraggable";
import { TaskSortable } from "./TaskSortable";

type Props = {
	task: ITask;
	activeIndex: number;
	containerRef: RefObject<HTMLDivElement>;
};

export const Task = ({ task, activeIndex, containerRef }: Props) => {
	const elRoot = useRef<HTMLDivElement>(null);
	const dateStart = useGanttStore.use.dateStart();

	const position = _calculateTaskPosition(dateStart, task);

	return (
		<div className="task" ref={elRoot}>
			<div style={{ width: `${position.width}px`, transform: `translateX(${position.x}px)` }}>
				<TaskSortable task={task} activeIndex={activeIndex} key={task.id} parentRef={elRoot}>
					<TaskDraggable task={task} position={position}>
						<TaskContent task={task} containerRef={containerRef} />
					</TaskDraggable>
				</TaskSortable>
			</div>
		</div>
	);
};

const _calculateTaskPosition = (ganttStart: number, task: ITask): { width: number; x: number } => {
	const rangeOffset = differenceInDays(task.start, new Date(ganttStart).toISOString()) + 1;
	const rangeLength = differenceInDays(task.end, task.start) + 1;

	return { width: rangeLength * COL_WIDTH, x: rangeOffset * COL_WIDTH };
};
