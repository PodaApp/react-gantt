import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

import { tasksSingle, tasksSingleLong, tasksWithUnscheduled } from "./__fixtures__/tasks";
import { getBoundingClientRect, isTextTruncated } from "./utils/domUtils";
import { clickElementCenter, dragElementOver, dragElementTo } from "./utils/dragUtils";
import { tasksTableHelper } from "./utils/taskTableUtils";
import { tasksHelper } from "./utils/taskUtils";

test.beforeEach(async ({ page }) => {
	await page.evaluate(() => {
		const cursor = document.createElement("div");
		cursor.style.width = "10px";
		cursor.style.height = "10px";
		cursor.style.background = "red";
		cursor.style.position = "absolute";
		cursor.style.borderRadius = "50%";
		cursor.style.zIndex = "9999";
		document.body.appendChild(cursor);

		document.addEventListener("mousemove", (e) => {
			cursor.style.left = `${e.clientX}px`;
			cursor.style.top = `${e.clientY}px`;
		});
	});
});

export const ganttDateCentered = new Date(2025, 0, 1);

test.describe("tasks", () => {
	test("shows a task bar for each task provided when dates have been provided", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksHelper({ page });

		const taskOne = await getTaskAtIndex(0);
		const taskOneDetails = await taskOne.getDetails();
		expect(taskOneDetails.title).toBe(tasksWithUnscheduled[0]!.title);
		expect(taskOneDetails.dateStart).toEqual(tasksWithUnscheduled[0]!.start);
		expect(taskOneDetails.dateEnd).toEqual(tasksWithUnscheduled[0]!.end);
		expect(taskOneDetails.duration).toBe(5);

		const taskTwo = await getTaskAtIndex(1);
		await expect(taskTwo.getTitle()).toHaveText(tasksWithUnscheduled[1]!.title);

		const taskThree = await getTaskAtIndex(2);
		await expect(taskThree.getTitle()).toHaveText(tasksWithUnscheduled[2]!.title);

		// Unscheduled task
		const taskFour = await getTaskAtIndex(3);
		await expect(taskFour.isTaskWithNoDate()).toBeTruthy();
	});

	test("shows a handle and tooltip when hovering over the edge of a task", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksHelper({ page });

		const task = await getTaskAtIndex(0);
		const taskRect = await getBoundingClientRect(task.getTaskBar());

		await page.mouse.move(taskRect.left + 1, taskRect.top + taskRect.height / 2);
		await expect(task.getTooltips().nth(0)).toBeVisible();
		await expect(task.getTooltips().nth(1)).toBeHidden();
		await expect(task.getTooltips().nth(0)).toHaveText("Dec 30");

		await page.mouse.move(taskRect.right - 1, taskRect.top + taskRect.height / 2);
		await expect(task.getTooltips().nth(1)).toBeVisible();
		await expect(task.getTooltips().nth(0)).toBeHidden();
		await expect(task.getTooltips().nth(1)).toHaveText("Jan 03");
	});

	test("shows a jump to task start button when the task leaves the viewport", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

		const { getTaskAtIndex } = tasksHelper({ page });

		const timeline = page.locator(".gantt__scrollable");
		const timelineRect = await getBoundingClientRect(timeline);

		const task = await getTaskAtIndex(0);
		const taskRect = await getBoundingClientRect(task.getTaskBar());

		await expect(page.locator(".taskOverflow")).toHaveCount(0);

		const scrollDistance = taskRect.left - timelineRect.left + taskRect.width / 2;

		await timeline.evaluate((el, distance) => {
			el.scrollBy({ left: distance });
		}, scrollDistance);

		const taskOverflow = page.locator(".taskOverflow");

		await expect(task.getTitle()).not.toBeVisible();
		await expect(taskOverflow.locator(".task__title")).toBeVisible();
		await expect(taskOverflow.locator(".task__title")).toHaveText(tasksSingle[0]!.title);

		const overflowButton = taskOverflow.locator(".taskOverflow__button");
		await overflowButton.hover();

		await expect(taskOverflow.locator(".tooltip__tip")).toBeVisible();
		await expect(taskOverflow.locator(".tooltip__tip")).toHaveText("Dec 30, 2024  Jan 03, 2025");

		await timeline.evaluate((el, distance) => {
			el.scrollBy({ left: distance });
		}, scrollDistance);

		await expect(taskOverflow.locator(".task__title")).not.toBeVisible();
		await overflowButton.click();

		// Waiting for smooth scrolling to complete
		await page.waitForTimeout(700);

		const finalRect = await getBoundingClientRect(task.getTaskBar());
		const finalLeft = finalRect.left - timelineRect.left;

		// 5 Days @ 40px per day
		expect(finalLeft).toBeGreaterThanOrEqual(200);
	});

	test("should not show jump to task buttons when dragging a task", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

		const { getTaskAtIndex } = tasksHelper({ page });

		const task = await getTaskAtIndex(0);
		const timeLine = page.locator(".gantt__scrollable");

		const timeLineRect = await getBoundingClientRect(timeLine);

		await dragElementTo(task.getContent(), timeLineRect.right, timeLineRect.top, { page, mouseUp: false });
		await expect(page.locator(".taskOverflow")).not.toBeVisible();

		await dragElementTo(task.getContent(), timeLineRect.left, timeLineRect.top, { page, mouseUp: false });
		await expect(page.locator(".taskOverflow")).not.toBeVisible();
	});

	test("shows a jump to task end button when the task leaves the viewport", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

		const { getTaskAtIndex } = tasksHelper({ page });

		const timeline = page.locator(".gantt__scrollable");
		const timelineRect = await getBoundingClientRect(timeline);

		const task = await getTaskAtIndex(0);
		const taskRect = await getBoundingClientRect(task.getTaskBar());

		await expect(page.locator(".taskOverflow")).toHaveCount(0);

		const scrollDistance = taskRect.right - timelineRect.right - taskRect.width / 2;

		await timeline.evaluate((el, distance) => {
			el.scrollBy({ left: distance });
		}, scrollDistance);

		const taskOverflow = page.locator(".taskOverflow");

		await expect(taskOverflow.locator(".task__title")).not.toBeVisible();

		const overflowButton = taskOverflow.locator(".taskOverflow__button");
		await overflowButton.hover();
		await expect(taskOverflow.locator(".tooltip__tip")).toBeVisible();
		await expect(taskOverflow.locator(".tooltip__tip")).toHaveText("Dec 30, 2024  Jan 03, 2025");

		await overflowButton.click();

		// Waiting for smooth scrolling to complete
		await page.waitForTimeout(500);

		const finalRect = await getBoundingClientRect(task.getTaskBar());
		const finalRight = timelineRect.right - finalRect.right;

		// 5 Days @ 40px per day
		expect(finalRight).toBeGreaterThanOrEqual(200);
	});

	test("shows jump to start and jump to end buttons for large tasks that excede the viewports width", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingleLong} dateCentered={ganttDateCentered} />);

		const taskOverflow = page.locator(".taskOverflow");

		await expect(taskOverflow).toHaveCount(2);
		await expect(taskOverflow.locator(".taskOverflow__button")).toHaveCount(2);
		await expect(taskOverflow.locator(".task__title")).toBeVisible();
		await expect(taskOverflow.locator(".task__title")).toHaveText(tasksSingleLong[0]!.title);
	});

	test("focuses tasks on hover", async ({ mount, page }) => {
		mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksHelper({ page });

		const taskOne = await getTaskAtIndex(0);
		const taskOneRect = await getBoundingClientRect(taskOne.getTaskBar());

		await taskOne.getTaskBar().hover();

		const timelineBar = page.locator(".header .timelineBar");
		const timelineBarRect = await getBoundingClientRect(timelineBar);

		expect(timelineBarRect.left).toEqual(taskOneRect.left);
		expect(timelineBarRect.width).toEqual(taskOneRect.width);

		const taskTwo = await getTaskAtIndex(0);
		const taskTwoRect = await getBoundingClientRect(taskOne.getTaskBar());

		await taskTwo.getTaskBar().hover();

		const timelineBarTwoRect = await getBoundingClientRect(timelineBar);

		expect(timelineBarTwoRect.left).toEqual(taskTwoRect.left);
		expect(timelineBarTwoRect.width).toEqual(taskTwoRect.width);
	});
	test("clears task focus when the mouse interacts with and element outside of the timeline", async ({ mount, page }) => {
		mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksHelper({ page });

		const taskOne = await getTaskAtIndex(0);
		await taskOne.getTaskBar().hover();

		const header = page.locator(".header");

		await expect(header.locator(".timelineBar")).toHaveCount(1);

		await header.click();

		await expect(header.locator(".timelineBar")).toHaveCount(0);
	});
});

test.describe("task table", () => {
	test("can toggle the visibility of the task table", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const { getToggleButton, getAllTasks } = tasksTableHelper({ page });

		await expect(getAllTasks()).toHaveCount(tasksWithUnscheduled.length);
		await getToggleButton().click();
		await expect(getAllTasks()).toHaveCount(0);
		await getToggleButton().click();
		await expect(getAllTasks()).toHaveCount(tasksWithUnscheduled.length);
	});
	test("allows the title to be edited when clicked", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const task = await getTaskAtIndex(0);
		await task.getTitle().click();

		const expectedTitle = "Updated Task Title";
		await page.keyboard.type(expectedTitle);
		await page.keyboard.press("Enter");
		await expect(task.getTitle()).toHaveText(expectedTitle);
	});
	test("should increase the textarea height for long title when editing in the table view", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const task = await getTaskAtIndex(0);
		await task.getTitle().click();
		const { height: originalHeight } = await getBoundingClientRect(task.getTitleInput());

		const expectedTitle = "This is a long task title that should increase the height of the textarea";
		await page.keyboard.type(expectedTitle);

		const { height: finalHeight } = await getBoundingClientRect(task.getTitleInput());
		expect(finalHeight).toBeGreaterThan(originalHeight);

		await page.keyboard.press("Enter");
		await expect(task.getTitle()).toHaveText(expectedTitle);
	});
	test("should truncate the title in the table view when the title is too long", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const task = await getTaskAtIndex(0);
		await task.getTitle().click();

		await page.keyboard.type("This is a long task title that should increase the height of the textarea");
		await page.keyboard.press("Enter");

		const truncatesTaskTitle = await isTextTruncated(task.getTitle());
		expect(truncatesTaskTitle).toEqual(true);
	});
	test("should save changes to title when any other element is clicked", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const task = await getTaskAtIndex(0);
		await task.getTitle().click();

		const expectedTitle = "Updated Task Title";
		await page.keyboard.type(expectedTitle);
		await clickElementCenter(page.locator("body"), { page });

		await expect(task.getTitle()).toHaveText(expectedTitle);
	});

	test("allows you to add a task after the position of a selected task", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const task = await getTaskAtIndex(0);
		await (await task.getAddTaskButton()).click();

		const expectedTaskTitle = "New Task";

		await page.keyboard.type(expectedTaskTitle);
		await page.keyboard.press("Enter");

		const newTask = await getTaskAtIndex(1);
		await expect(newTask.getTitle()).toHaveText(expectedTaskTitle);
	});
	test("allows you to add a task at the end of the task list", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex, getNewTaskButton } = tasksTableHelper({ page });

		await getNewTaskButton().click();

		const expectedTaskTitle = "New Task";

		await page.keyboard.type(expectedTaskTitle);
		await page.keyboard.press("Enter");

		const newTask = await getTaskAtIndex(tasksSingle.length);
		await expect(newTask.getTitle()).toHaveText(expectedTaskTitle);
	});
	test("allows tasks to be reordered from the task table", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const taskOne = await getTaskAtIndex(0);
		const taskThree = await getTaskAtIndex(2);

		const dragHandle = await taskOne.getSortHandle();

		await dragElementOver(dragHandle, taskThree.getTitle(), { page });

		await expect(taskOne.getTitle()).toHaveText(tasksWithUnscheduled[1]!.title);
		await expect(taskThree.getTitle()).toHaveText(tasksWithUnscheduled[0]!.title);

		const { getTaskAtIndex: getTimelineTaskAtIndex } = tasksHelper({ page });

		const timelineTaskOne = await getTimelineTaskAtIndex(0);
		const timelineTaskThree = await getTimelineTaskAtIndex(2);

		await expect(timelineTaskOne.getTitle()).toHaveText(tasksWithUnscheduled[1]!.title);
		await expect(timelineTaskThree.getTitle()).toHaveText(tasksWithUnscheduled[0]!.title);
	});

	test("does not show actions when being reordered", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const taskOne = await getTaskAtIndex(0);
		const taskThree = await getTaskAtIndex(2);

		const dragHandle = await taskOne.getSortHandle();

		await dragElementOver(dragHandle, taskThree.getTitle(), { page, mouseUp: false });

		const taskThreeSortHandle = await taskThree.getSortHandle();
		const taskThreeAddTaskButton = await taskThree.getAddTaskButton();

		await expect(taskThreeSortHandle).not.toBeVisible();
		await expect(taskThreeAddTaskButton).not.toBeVisible();
	});
	test("does not show actions when being edited", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const taskOne = await getTaskAtIndex(0);
		await taskOne.getTitle().click();

		const taskThree = await getTaskAtIndex(2);
		const taskThreeRect = await getBoundingClientRect(taskThree.getTitle());
		await page.mouse.move(taskThreeRect.left + 1, taskThreeRect.top + taskThreeRect.height / 2);

		const taskThreeSortHandle = await taskThree.getSortHandle();
		const taskThreeAddTaskButton = await taskThree.getAddTaskButton();

		await expect(taskThreeSortHandle).not.toBeVisible();
		await expect(taskThreeAddTaskButton).not.toBeVisible();
	});

	test("should not allow task to be scheduled on the timeline when the title is being edited", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const { getTaskAtIndex } = tasksTableHelper({ page });

		const taskOne = await getTaskAtIndex(0);
		await taskOne.getTitle().click();

		const taskUnsheduled = await getTaskAtIndex(3);

		const timeLine = page.locator(".gantt__scrollable"); //TODO Create timeline page object
		const timeLineRect = await getBoundingClientRect(timeLine);
		const timelineTaskUnscheduledRect = await getBoundingClientRect(taskUnsheduled.getTitle());

		const timelineCenterTaskThree = {
			x: timeLineRect.left + timeLineRect.width / 2,
			y: timelineTaskUnscheduledRect.top + timelineTaskUnscheduledRect.height / 2,
		};
		await page.mouse.move(timelineCenterTaskThree.x, timelineCenterTaskThree.y);
		await expect(page.locator(".newTaskPlaceholder")).not.toBeVisible(); //TODO add to tasks page object
	});
});

test.describe("zoom", () => {
	test.skip("shows each the date for day when the zoom is set to week", () => {});
	test.skip("shows weekend when the zoom is set to week ", () => {});
	test.skip("shows first of the month when zoom is set to greater than a week", () => {});
	test.skip("shows only the dates for mondays when the zoom is set to greater than week", () => {});
	test.skip("the width of a month changes based on the zoom level", () => {});
	test.skip("the total rendered duration of the timeline changes based on the zoom level", () => {});
	test.skip("the date centered on the timeline does not change when the zoom level changes", () => {});
	test.skip("task sizes are adjusted to fit the zoom level", () => {});
	test.skip("the focused task duration only shows start and end dates when the zoom level is greater than week", () => {});
});
