import { useTaskPosition } from "../../hooks/useTaskPosition";

import "./weekend.css";

type Props = {
	daysOffset?: number;
};

export const Weekend = ({ daysOffset = 0 }: Props) => {
	const { gridWidth, getWidthFromDays } = useTaskPosition();

	const x = getWidthFromDays(daysOffset);
	const width = gridWidth * 2;

	const weekendStyles = {
		"--weekend-x": `${x}px`,
		"--weekend-width": `${width}px`,
	} as React.CSSProperties;

	return <div className="weekend" style={weekendStyles} />;
};
