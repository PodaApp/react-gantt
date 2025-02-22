import { useTaskPosition } from "../hooks/useTaskPosition";
import "./FirstOfTheMonth.css";

type Props = {
	offsetDays: number;
};

export const FirstOfTheMonth = ({ offsetDays }: Props) => {
	const { getWidthFromDays } = useTaskPosition();

	const x = getWidthFromDays(offsetDays);

	const firstOfMonthStyle = {
		"--first-of-month-x": `${x}px`,
	} as React.CSSProperties;

	return <div className="firstOfTheMonth" style={firstOfMonthStyle} />;
};
