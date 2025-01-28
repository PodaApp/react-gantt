import { memo } from "react";

import { Weekend } from "./Weekend";

const mockWeekends = [
	3, 10, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80, 87, 94, 101, 108, 115, 122, 129, 136, 143, 150, 157, 164, 171, 178, 185, 192, 199, 206, 213, 220,
	227, 234, 241, 248, 255, 262, 269, 276, 283, 290, 297, 304, 311, 318, 325, 332, 339, 346, 353, 360,
];

type Props = {
	weekends?: number[];
};

export const Weekends: React.FC<Props> = memo(({ weekends = mockWeekends }) => {
	return (
		<>
			{weekends.map((daysOffset) => (
				<Weekend key={daysOffset} daysOffset={daysOffset} />
			))}
		</>
	);
});

Weekends.displayName = "Weekends";
