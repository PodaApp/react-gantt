import { ReactNode } from "react";

import classNames from "classnames";

import "./Tooltip.css";

type Props = {
	direction: "left" | "right";
	gap: number;
	tip: string | ReactNode;
	children: ReactNode;
};

export const Tooltip: React.FC<Props> = ({ tip, direction, gap, children }) => {
	const tooltipClassName = classNames({
		tooltip__tip: true,
		"tooltip__tip--right": direction === "right",
	});

	const tooltipStyles = {
		"--tooltip-gap": `${gap}px`,
	} as React.CSSProperties;

	return (
		<>
			<div className="tooltip">{children}</div>
			<div className={tooltipClassName} style={tooltipStyles}>
				{tip}
			</div>
		</>
	);
};
