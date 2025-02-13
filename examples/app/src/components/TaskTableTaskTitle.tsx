type Props = {
	title: string;
	onClick?: () => void;
};

export const TaskTableTaskTitle = ({ title, onClick }: Props) => {
	return (
		<div className="taskTableTask__title" onClick={onClick}>
			<span>{title}</span>
		</div>
	);
};
