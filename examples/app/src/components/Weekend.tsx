import { GRID_WIDTH } from "../constants";
import "./weekend.css";

type Props = {
	daysOffset?: number;
};

export const Weekend = ({ daysOffset = 0 }: Props) => {
	const x = daysOffset * GRID_WIDTH;

	return <div className="weekend" style={{ transform: `translateX(${x}px)` }} />;
};
