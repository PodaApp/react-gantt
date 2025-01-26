import { COL_WIDTH } from "../constants";
import "./weekend.css";

type Props = {
  daysOffset?: number;
}

export const Weekend = ({daysOffset = 0}: Props) => {
  const x = daysOffset * COL_WIDTH;

  return (
      <div className="weekend" style={{transform: `translateX(${x}px)`}} />
  );
}
