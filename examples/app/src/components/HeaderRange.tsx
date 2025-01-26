import { differenceInDays, getDayOfYear } from "date-fns";

import { COL_WIDTH } from "../constants";
import { ITask } from "../types";
import "./HeaderRange.css";

type Props = {
	node: ITask;
};

export const HeaderRange = ({ node }: Props) => {
	const rangeOffset = getDayOfYear(node.start) - 1;
	const rangeLength = differenceInDays(node.end, node.start) + 1;

	const width = rangeLength * COL_WIDTH;
	const x = rangeOffset * COL_WIDTH;

	return <div className="headerRange" style={{ width, transform: `translateX(${x}px)` }} />;
};
