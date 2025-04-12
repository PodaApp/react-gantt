import { FocusEvent, useCallback, useLayoutEffect, useRef } from "react";

import { useBindShortcut } from "../../hooks/useBindShortcut";
import { useGanttStore } from "../../hooks/useGanttStore";

import "./TaskTitleInline.css";

type Props = {
	id: string;
	title: string;
	placeholder?: string;
	onComplete?: (id: string, value: string) => void;
};

/**
 * NOTE: Consider using contenteditable rather than field-sizing. Currently
 * field-sizing has limited browser adoption. This may require this component
 * to be split as adding tasks on the timeline view requires a place holder
 * and an input element may still be the best choice there... But at the moment
 * it works on my machine ;)
 */

export const TaskTitleInline = ({ id, title, placeholder, onComplete }: Props) => {
	const elInput = useRef<HTMLTextAreaElement>(null);

	const setTaskTitle = useGanttStore((state) => state.setTaskTitle);

	useLayoutEffect(() => {
		elInput.current?.select();
	}, []);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLTextAreaElement>) => {
			setTaskTitle(id, event.target.value);
			// TODO: On complete may not be needed if isEditing is in zustand
			if (onComplete) onComplete(id, event.target.value);
		},
		[id, onComplete, setTaskTitle],
	);

	const handleKeyboardEvent = useCallback(() => {
		elInput.current?.blur();
	}, []);

	useBindShortcut("escape", handleKeyboardEvent, elInput);
	useBindShortcut("enter", handleKeyboardEvent, elInput);

	return <textarea className="taskTitleInline" defaultValue={title} placeholder={placeholder} onBlur={handleBlur} ref={elInput} />;
};
