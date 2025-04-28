# React Gantt

React Gantt is a lightweight Gantt chart UI inspired by Notion's Gantt interface.
This project is currently a work in progress and not yet ready for production use.

## Getting started

To install and use the libraries you can see it here: 

#### Installation
  
```sh
npm install @nikglavin/react-gantt
```

### Basic usage
```jsx
import { Gantt, type ITask } from "@nikglavin/react-gantt";
import "@nikglavin/react-gantt/style.css";

const tasks: ITask[] = [
		{
			id: "0",
			title: "One",
			start: new Date(2025, 2, 10),
			end: new Date(2025, 2, 14),
		},
		{ id: "3", title: "two", start: null, end: null },
];

export function App() {
  return (
    <Gantt tasks={tasks} />
  );
}

```

## TODO
### Must have pre "release"
- Event hooks
- Github actions
- Additional Examples 
  - Load testing (1K+ tasks)
  - Theming
- Separate UI state (creating) from input state (ITask)

### Additional Features
- Config options
- Materialized view / infinite scroll (react-virtual)
- Task context menu
- Task dependencies
- Current cursor position
- Tasks with no end date
- Task milestones
- Today marker based on time of day
- Task progress
- Task hierarchy