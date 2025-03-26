import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

import { tasksSingle, tasksWithUnscheduled } from "./__fixtures__/tasks";
import { TaskTablePage } from "./pageObjects/TaskTablePage";
import { TimelinePage } from "./pageObjects/TimelinePage";
import { getBoundingClientRect, isTextTruncated } from "./utils/domUtils";
import { clickElementCenter, dragElementOver } from "./utils/mouseUtils";

export const ganttDateCentered = new Date(2025, 0, 1);

test.describe("Task table visibility", () => {
	test("toggles the visibility of the task table", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		await expect(taskTable.getAllTasks()).toHaveCount(tasksWithUnscheduled.length);
		await taskTable.getToggleButton().click();
		await expect(taskTable.getAllTasks()).toHaveCount(0);
		await taskTable.getToggleButton().click();
		await expect(taskTable.getAllTasks()).toHaveCount(tasksWithUnscheduled.length);
	});
});

test.describe("Task title editing", () => {
	test("allows task titles to be edited", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		const task = await taskTable.getTaskAtIndex(0);
		await task.getTitle().click();

		const expectedTitle = "Updated Task Title";
		await page.keyboard.type(expectedTitle);
		await page.keyboard.press("Enter");
		await expect(task.getTitle()).toHaveText(expectedTitle);
	});

	test("expands the textarea height for long titles during editing", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		const task = await taskTable.getTaskAtIndex(0);
		await task.getTitle().click();
		const { height: originalHeight } = await getBoundingClientRect(task.getTitleInput());

		const expectedTitle = "This is a long task title that should increase the height of the textarea";
		await page.keyboard.type(expectedTitle);

		const { height: finalHeight } = await getBoundingClientRect(task.getTitleInput());
		expect(finalHeight).toBeGreaterThan(originalHeight);

		await page.keyboard.press("Enter");
		await expect(task.getTitle()).toHaveText(expectedTitle);
	});

	test("truncates long task titles in the table view", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		const task = await taskTable.getTaskAtIndex(0);
		await task.getTitle().click();

		await page.keyboard.type("This is a long task title that should increase the height of the textarea");
		await page.keyboard.press("Enter");

		const truncatesTaskTitle = await isTextTruncated(task.getTitle());
		expect(truncatesTaskTitle).toEqual(true);
	});

	test("saves title changes when clicking outside the input", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		const task = await taskTable.getTaskAtIndex(0);
		await task.getTitle().click();

		const expectedTitle = "Updated Task Title";
		await page.keyboard.type(expectedTitle);
		await clickElementCenter(page.locator("body"), { page });

		await expect(task.getTitle()).toHaveText(expectedTitle);
	});
});

test.describe("Task creation", () => {
	test("adds a new task after the selected task", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		const task = await taskTable.getTaskAtIndex(0);
		await (await task.getAddTaskButton()).click();

		const expectedTaskTitle = "New Task";

		await page.keyboard.type(expectedTaskTitle);
		await page.keyboard.press("Enter");

		const newTask = await taskTable.getTaskAtIndex(1);
		await expect(newTask.getTitle()).toHaveText(expectedTaskTitle);
	});

	test("adds a new task at the end of the task list", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		await taskTable.getNewTaskButton().click();

		const expectedTaskTitle = "New Task";

		await page.keyboard.type(expectedTaskTitle);
		await page.keyboard.press("Enter");

		const newTask = await taskTable.getTaskAtIndex(tasksSingle.length);
		await expect(newTask.getTitle()).toHaveText(expectedTaskTitle);
	});
});

test.describe("Task reordering", () => {
	test("reorders tasks from the task table", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		const taskOne = await taskTable.getTaskAtIndex(0);
		const taskThree = await taskTable.getTaskAtIndex(2);

		const dragHandle = await taskOne.getSortHandle();

		await dragElementOver(dragHandle, taskThree.getTitle(), { page });

		await expect(taskOne.getTitle()).toHaveText(tasksWithUnscheduled[1]!.title);
		await expect(taskThree.getTitle()).toHaveText(tasksWithUnscheduled[0]!.title);

		const timelinePage = new TimelinePage(page);

		const timelineTaskOne = await timelinePage.getTaskAtIndex(0);
		const timelineTaskThree = await timelinePage.getTaskAtIndex(2);

		await expect(timelineTaskOne.getTitle()).toHaveText(tasksWithUnscheduled[1]!.title);
		await expect(timelineTaskThree.getTitle()).toHaveText(tasksWithUnscheduled[0]!.title);
	});

	test("hides actions while tasks are being reordered", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		const taskOne = await taskTable.getTaskAtIndex(0);
		const taskThree = await taskTable.getTaskAtIndex(2);

		const dragHandle = await taskOne.getSortHandle();

		await dragElementOver(dragHandle, taskThree.getTitle(), { page, mouseUp: false });

		const taskThreeSortHandle = await taskThree.getSortHandle();
		const taskThreeAddTaskButton = await taskThree.getAddTaskButton();

		await expect(taskThreeSortHandle).not.toBeVisible();
		await expect(taskThreeAddTaskButton).not.toBeVisible();
	});

	test("hides actions while tasks are being edited", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const taskTable = new TaskTablePage(page);

		const taskOne = await taskTable.getTaskAtIndex(0);
		await taskOne.getTitle().click();

		const taskThree = await taskTable.getTaskAtIndex(2);
		const taskThreeRect = await getBoundingClientRect(taskThree.getTitle());
		await page.mouse.move(taskThreeRect.left + 1, taskThreeRect.top + taskThreeRect.height / 2);

		const taskThreeSortHandle = await taskThree.getSortHandle();
		const taskThreeAddTaskButton = await taskThree.getAddTaskButton();

		await expect(taskThreeSortHandle).not.toBeVisible();
		await expect(taskThreeAddTaskButton).not.toBeVisible();
	});

	test("prevents scheduling tasks on the timeline while editing titles", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const taskTablePage = new TaskTablePage(page);
		const timelinePage = new TimelinePage(page);

		const taskOne = await taskTablePage.getTaskAtIndex(0);
		await taskOne.getTitle().click();

		const taskUnscheduled = await taskTablePage.getTaskAtIndex(3);

		const timeLine = timelinePage.getScrollableArea();
		const timeLineRect = await getBoundingClientRect(timeLine);
		const timelineTaskUnscheduledRect = await getBoundingClientRect(taskUnscheduled.getTitle());

		const timelineCenterTaskThree = {
			x: timeLineRect.left + timeLineRect.width / 2,
			y: timelineTaskUnscheduledRect.top + timelineTaskUnscheduledRect.height / 2,
		};
		await page.mouse.move(timelineCenterTaskThree.x, timelineCenterTaskThree.y);
		await expect(timelinePage.getNewTaskPlaceholder()).not.toBeVisible();
	});
});
