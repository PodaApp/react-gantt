# TODO

## Notion Features

- [x] Sidebar task view
- [x] Different scales (Week, Month, Quarter, Year)

- Materialised view / infinate scroll
- Prev, Today, Next navigation

- Simple task details
- Today marker based on time of day
- Loose focus on board click

- Task context menu
- Task dependencies

## Linear Features

- Current cursor position
- Tasks with no end date
- Task milestones

## React Gantt

- Task progress
- Task hierarchy
- Config options

## Non-functional

- Performance
- Testing
- Documentation
- Marketing site
- Action TODO's
- Review code

# Test plan

## Task table

- Should be able to edit a title when clicked
- Should be able to add a new task after an existing item
- Should be able to add a new task at the end of the list
- Should be able to reorder tasks in the list
- Should not show actions when a task is editing or being reordered
- Should not allow task to be schdeuld on the timeline when the title is being edited
- Should be able to collapse the table view
- Should extend the textarea for long title when editing in the table view
- Should show elipse for titles that exceede the with of the table view

## Scale

- Should allow the user to select (week, month, quarter)
- Should show weekends for week and month view
- Should show line deliniating the start of the month for quarter view
- Should include the dates in the range slider for quarter view
- Should include the date for every monday in the month for the month and quarter view
- Should include the date for the second and fourth monday on the

Two potential algorithims

Variable month width COL_WIDTH = scaleMap[value] / 32;

Fixed unit width COLW_WIDTh = $unitWidth / $unitCount
