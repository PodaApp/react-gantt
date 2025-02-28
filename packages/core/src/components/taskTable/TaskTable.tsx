import { NewTaskButton } from "../NewTaskButton";
import { ButtonTaskTableOpen } from "./ButtonTaskTableOpen";
import { TaskTableTasks } from "./TaskTableTasks";

import "./TaskTable.css";

export const TaskTable = () => {
	return (
		<div className="taskTable">
			<div className="taskTable__header">
				<div className="taskTable__headerClose">
					<ButtonTaskTableOpen hide="onClose" />
				</div>
				<div>Title</div>
			</div>
			<div className="taskTable__tasks">
				<TaskTableTasks />
				<NewTaskButton hide="onClose" />
			</div>
		</div>
	);
};
