import { GanttStoreProps } from "../store/ganttStore";
import { ITask } from "./tasks";

export type GanttProps<TaskType extends ITask = ITask> = Partial<GanttStoreProps<TaskType>>;
