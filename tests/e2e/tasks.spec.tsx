import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

import { tasksSingle, tasksWithUnscheduled } from "./__fixtures__/tasks";
import { getBoundingClientRect } from "./utils/domUtils";
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

	test.skip("allows tasks to be scheduled when a task is passed without a start and end date", () => {});
	test.skip("focuses tasks on hover", () => {});
	test.skip("unfocuses a task when the mouse interacts with another element", () => {});
	test.skip("the task title overflow the task bar when its width is greater than the tasks duration", () => {});
});

test.describe("task table", () => {
	test.skip("shows the task table when the button is clicked", () => {});
	test.skip("hides the task table when the button is clicked again", () => {});
	test.skip("shows a task table row for each task provided", () => {});
	test.skip("allows the task title to be edited when clicked", () => {});
	test.skip("allows you to add a task after the position of a selected task", () => {});
	test.skip("allows you to add a task at the end of the task list", () => {});
	test.skip("does not show actions when a task is editing or being reordered", () => {});
	test.skip("should not allow task to be scheduled on the timeline when the title is being edited", () => {});
	test.skip("should increase the textarea height for long title when editing in the table view", () => {});
	test.skip("should show ellipsis for titles that exceed the width of the table view", () => {});
	test.skip("allows tasks to be reordered from the task table", () => {});
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
