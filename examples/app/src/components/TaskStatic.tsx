import { ITask } from "../types";

type Props = {
	task: ITask;
	showTitle?: boolean;
};

export const TaskStatic = ({ task, showTitle = true }: Props) => {
	return (
		<>
			<div className="taskContent__beacon" data-position="start" data-id={task.id} />
			<div className="taskContent__bar" data-id={task.id}></div>
			<div className="taskContent__beacon" data-position="end" data-id={task.id} />

			{showTitle && (
				<div className="taskContent__content">
					<div className="taskContent__title">{task.title}</div>
					<div className="taskContent__title taskContent__title--behind">{task.title}</div>
				</div>
			)}
		</>
	);
};
