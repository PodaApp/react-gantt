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

	const setTaskTitle = useGanttStore.use.setTaskTitle();

	useEffect(() => {
		elInput.current?.select();
	}, []);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLInputElement>) => {
			setTaskTitle(id, event.target.value);
		},
		[id, setTaskTitle],
	);

	const handleKeyboardEvent = () => {
		elInput.current?.blur();
	};

	useBindShortcut("escape", handleKeyboardEvent, elInput);
	useBindShortcut("enter", handleKeyboardEvent, elInput);

	return <input type="text" defaultValue={title} placeholder="Type a name..." onBlur={handleBlur} className="taskTitleInline" ref={elInput} />;
};
