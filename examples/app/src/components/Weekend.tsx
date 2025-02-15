import { getWidthFromDays } from "../utils/getWidthFromDays";
import "./weekend.css";

type Props = {
	daysOffset?: number;
};

export const Weekend = ({ daysOffset = 0 }: Props) => {
	const x = getWidthFromDays(daysOffset);

	return <div className="weekend" style={{ transform: `translateX(${x}px)` }} />;
};
