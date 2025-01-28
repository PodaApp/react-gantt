import { memo } from "react";

import { differenceInDays } from "date-fns";

import { COL_WIDTH } from "../constants";
import "./Today.css";

type Props = {
	ganttStartDate: number;
};

export const Today = memo(({ ganttStartDate }: Props) => {
	const offset = differenceInDays(new Date().toISOString(), new Date(ganttStartDate).toISOString()) + 1;
	const x = offset * COL_WIDTH - COL_WIDTH / 1.9;

	return <div className="today" style={{ transform: `translateX(${x}px)` }} />;
});

Today.displayName = "Today";
