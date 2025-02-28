import { ReactNode } from "react";

import classNames from "classnames";

import "./Tooltip.css";

type Props = {
	direction: "left" | "right";
	tip: string | ReactNode;
	children: ReactNode;
};

export const Tooltip: React.FC<Props> = ({ tip, direction, children }) => {
	const tooltipClassName = classNames({
		tooltip__tip: true,
		"tooltip__tip--right": direction === "right",
	});

	return (
		<>
			<div className="tooltip">{children}</div>
			<div className={tooltipClassName}>{tip}</div>
		</>
	);
};
