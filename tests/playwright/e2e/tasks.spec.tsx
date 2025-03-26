import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

import { tasksSingle, tasksSingleLong, tasksWithUnscheduled } from "./__fixtures__/tasks";
import { TimelinePage } from "./pageObjects/TimelinePage";
import { getBoundingClientRect } from "./utils/domUtils";
import { dragElementTo } from "./utils/mouseUtils";

export const ganttDateCentered = new Date(2025, 0, 1);

test.describe("Task rendering", () => {
	test("renders a task bar for each task with valid dates", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const timelinePage = new TimelinePage(page);

		const taskOne = await timelinePage.getTaskAtIndex(0);
		const taskOneDetails = await taskOne.getDetails();
		expect(taskOneDetails.title).toBe(tasksWithUnscheduled[0]!.title);
		expect(taskOneDetails.dateStart).toEqual(tasksWithUnscheduled[0]!.start);
		expect(taskOneDetails.dateEnd).toEqual(tasksWithUnscheduled[0]!.end);
		expect(taskOneDetails.duration).toBe(5);

		const taskTwo = await timelinePage.getTaskAtIndex(1);
		await expect(taskTwo.getTitle()).toHaveText(tasksWithUnscheduled[1]!.title);

		const taskThree = await timelinePage.getTaskAtIndex(2);
		await expect(taskThree.getTitle()).toHaveText(tasksWithUnscheduled[2]!.title);

		// Unscheduled task
		const taskFour = await timelinePage.getTaskAtIndex(3);
		await expect(taskFour.getTaskWithoutDate()).toBeTruthy();
	});

	test("displays handles and tooltips when hovering over task edges", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const timelinePage = new TimelinePage(page);

		const task = await timelinePage.getTaskAtIndex(0);
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
});

test.describe("Task actions", () => {
	test("shows a 'jump to task start' button when a task leaves the viewport", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const timelinePage = new TimelinePage(page);

		const timeline = page.locator(".gantt__scrollable");
		const timelineRect = await getBoundingClientRect(timeline);

		const task = await timelinePage.getTaskAtIndex(0);
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

	test("hides 'jump to task' buttons while dragging a task", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const timelinePage = new TimelinePage(page);

		const task = await timelinePage.getTaskAtIndex(0);
		const timeLine = page.locator(".gantt__scrollable");

		const timeLineRect = await getBoundingClientRect(timeLine);

		await dragElementTo(task.getContent(), timeLineRect.right, timeLineRect.top, { page, mouseUp: false });
		await expect(page.locator(".taskOverflow")).not.toBeVisible();

		await dragElementTo(task.getContent(), timeLineRect.left, timeLineRect.top, { page, mouseUp: false });
		await expect(page.locator(".taskOverflow")).not.toBeVisible();
	});

	test("shows a 'jump to task end' button when a task leaves the viewport", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const timelinePage = new TimelinePage(page);

		const timeline = page.locator(".gantt__scrollable");
		const timelineRect = await getBoundingClientRect(timeline);

		const task = await timelinePage.getTaskAtIndex(0);
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

	test("displays 'jump to start' and 'jump to end' buttons for large tasks exceeding viewport width", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingleLong} dateCentered={ganttDateCentered} />);

		const taskOverflow = page.locator(".taskOverflow");

		await expect(taskOverflow).toHaveCount(2);
		await expect(taskOverflow.locator(".taskOverflow__button")).toHaveCount(2);
		await expect(taskOverflow.locator(".task__title")).toBeVisible();
		await expect(taskOverflow.locator(".task__title")).toHaveText(tasksSingleLong[0]!.title);
	});
});

test.describe("Task focus", () => {
	test("focuses on a task when hovered", async ({ mount, page }) => {
		mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
		const timelinePage = new TimelinePage(page);

		const taskOne = await timelinePage.getTaskAtIndex(0);
		const taskOneRect = await getBoundingClientRect(taskOne.getTaskBar());

		await taskOne.getTaskBar().hover();

		const timelineBar = page.locator(".header .timelineBar");
		const timelineBarRect = await getBoundingClientRect(timelineBar);

		expect(timelineBarRect.left).toEqual(taskOneRect.left);
		expect(timelineBarRect.width).toEqual(taskOneRect.width);

		const taskTwo = await timelinePage.getTaskAtIndex(0);
		const taskTwoRect = await getBoundingClientRect(taskOne.getTaskBar());

		await taskTwo.getTaskBar().hover();

		const timelineBarTwoRect = await getBoundingClientRect(timelineBar);

		expect(timelineBarTwoRect.left).toEqual(taskTwoRect.left);
		expect(timelineBarTwoRect.width).toEqual(taskTwoRect.width);
	});

	test("removes task focus when interacting with elements outside the timeline", async ({ mount, page }) => {
		mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
		const timelinePage = new TimelinePage(page);

		const taskOne = await timelinePage.getTaskAtIndex(0);
		await taskOne.getTaskBar().hover();

		const header = page.locator(".header");

		await expect(header.locator(".timelineBar")).toHaveCount(1);

		await header.click();

		await expect(header.locator(".timelineBar")).toHaveCount(0);
	});
});
