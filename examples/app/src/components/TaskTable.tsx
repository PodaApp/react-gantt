import IconGrip from "../assets/grip-vertical.svg?react";
import IconPlus from "../assets/plus.svg?react";
import { useGanttStore } from "../store/ganttStore";
import { ButtonTaskNew } from "./ButtonTaskTableNew";
import { ButtonTaskTableOpen } from "./ButtonTaskTableOpen";
import "./TaskTable.css";

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
				{tasks.map((task) => (
					<>
						<div className="taskTable__task" key={task.id}>
							<div>{task.title}</div>
							<div className="taskTable__taskActions">
								<button className="taskTable__taskAction action">
									<IconPlus />
								</button>
								<button className="taskTable__taskAction action">
									<IconGrip />
								</button>
							</div>
						</div>
					</>
				))}
				<ButtonTaskNew hide="onClose" />
			</div>
		</div>
	);
};
