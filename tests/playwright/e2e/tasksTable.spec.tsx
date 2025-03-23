import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

import { tasksSingle, tasksWithUnscheduled } from "./__fixtures__/tasks";
import { getBoundingClientRect, isTextTruncated } from "./utils/domUtils";
import { clickElementCenter, dragElementOver } from "./utils/mouseUtils";
import { tasksTableHelper } from "./utils/taskTableUtils";
import { tasksHelper } from "./utils/taskUtils";

export const ganttDateCentered = new Date(2025, 0, 1);

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
