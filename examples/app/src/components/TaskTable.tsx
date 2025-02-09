import { useGanttStore } from "../store/ganttStore";
import { ButtonTaskNew } from "./ButtonTaskNew";
import { ButtonTaskTableOpen } from "./ButtonTaskTableOpen";
import "./TaskTable.css";
import { TaskTableTask } from "./TaskTableTask";

export const TaskTable = () => {
	const tasks = useGanttStore.use.tasks();

	return (
		<div className="taskTable">
			<div className="taskTable__header">
				<div className="taskTable__headerClose">
					<ButtonTaskTableOpen hide="onClose" />
				</div>
				<div>Title</div>
			</div>
			<div className="taskTable__tasks">
				{tasks.map((task, index) => (
					<TaskTableTask task={task} index={index} key={task.id} />
				))}
				<ButtonTaskNew hide="onClose" />
			</div>
		</div>
	);
};
