import { FocusEvent, useCallback, useEffect, useRef } from "react";

import { useBindShortcut } from "../hooks/useBindShortcut";
import { useGanttStore } from "../store/ganttStore";
import "./TaskTitleInline.css";

type Props = {
	id: string;
	title: string;
};

export const TaskTitleInline = ({ id, title }: Props) => {
	const elInput = useRef<HTMLInputElement>(null);

	const setTask = useGanttStore.use.setTask();

	useEffect(() => {
		elInput.current?.select();
	}, []);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLInputElement>) => {
			const title = event.target.value || "New Task";
			setTask(id, { title });
		},
		[id, setTask],
	);

	useBindShortcut("escape", handleBlur, elInput);
	useBindShortcut("enter", handleBlur, elInput);

	return <input type="text" defaultValue={title} placeholder="Type a name..." onBlur={handleBlur} className="taskTitleInline" ref={elInput} />;
};
