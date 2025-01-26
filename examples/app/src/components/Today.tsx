import { getDayOfYear } from "date-fns";
import { COL_WIDTH } from "../constants";
import "./Today.css"


export const Today = () => {
  const offset = getDayOfYear(new Date());
  const x = (offset * COL_WIDTH) - (COL_WIDTH / 1.9);

  return (
    <div className="today" style={{transform: `translateX(${x}px)`}} />
  );
}
