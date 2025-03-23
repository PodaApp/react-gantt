import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

import { GRID_WIDTH } from "../../../packages/core/src/constants";
import { tasksSingle, tasksWithUnscheduled } from "./__fixtures__/tasks";
import { TimelinePage } from "./pageObjects/TimelinePage";
import { getBoundingClientRect } from "./utils/domUtils";
import { clickElementCenter, dragElementOver, dragElementX, hoverElementCenter } from "./utils/mouseUtils";

const halfGridUnit = GRID_WIDTH / 2;
const dragDistanceNoChange = halfGridUnit - 1;
const dragDistancePlusOne = halfGridUnit + 1;

export const ganttDateCentered = new Date(2025, 0, 1);

test("edit a tasks start date", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const timelinePage = new TimelinePage(page);

	const task = await timelinePage.getTaskAtIndex(0);

	const before = await task.getDetails();
	expect(before.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(before.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(before.duration).toEqual(5);

	const taskHandleStart = await task.getHandleStart();
	await dragElementX(taskHandleStart, -dragDistancePlusOne, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual(new Date("2024-12-28T14:00:00.000Z"));
	expect(after.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(after.duration).toEqual(6);

	await expect(task.getTooltips().nth(0)).toHaveText("Dec 29");
});

test("task start date does not update until drag distance is greater than half a grid unit", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const timelinePage = new TimelinePage(page);

	const task = await timelinePage.getTaskAtIndex(0);

	const taskHandleStart = await task.getHandleStart();
	await dragElementX(taskHandleStart, -dragDistanceNoChange, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(after.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(after.duration).toEqual(5);

	await expect(task.getTooltips().nth(1)).toHaveText("Jan 03");
});

test("edit a tasks end date", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const timelinePage = new TimelinePage(page);

	const task = await timelinePage.getTaskAtIndex(0);

	const before = await task.getDetails();
	expect(before.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(before.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(before.duration).toEqual(5);

	const taskHandleEnd = page.locator(`.taskDraggableHandle`).nth(1);
	expect(taskHandleEnd).toHaveCount(1);
	await dragElementX(taskHandleEnd, dragDistancePlusOne, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(after.dateEnd).toEqual(new Date("2025-01-03T14:00:00.000Z"));
	expect(after.duration).toEqual(6);

	await expect(task.getTooltips().nth(1)).toHaveText("Jan 04");
});

test("task end date does not update until drag distance is greater than half a grid unit", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const timelinePage = new TimelinePage(page);

	const task = await timelinePage.getTaskAtIndex(0);

	const taskHandleEnd = page.locator(`.taskDraggableHandle`).nth(1);
	await dragElementX(taskHandleEnd, dragDistanceNoChange, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(after.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(after.duration).toEqual(5);

	await expect(task.getTooltips().nth(1)).toHaveText("Jan 03");
});

test("reschedule a task maintaining its duration", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const timelinePage = new TimelinePage(page);

	const task = await timelinePage.getTaskAtIndex(0);

	const before = await task.getDetails();
	expect(before.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(before.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(before.duration).toEqual(5);

	await dragElementX(task.getContent(), -40, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual(new Date("2024-12-28T14:00:00.000Z"));
	expect(after.dateEnd).toEqual(new Date("2025-01-01T14:00:00.000Z"));
	expect(after.duration).toEqual(5);

	await expect(task.getTooltips().nth(0)).toHaveText("Dec 29");
	await expect(task.getTooltips().nth(1)).toHaveText("Jan 02");
});

test("task dates do not update until drag distance is greater than half a grid unit", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const timelinePage = new TimelinePage(page);

	const task = await timelinePage.getTaskAtIndex(0);

	await dragElementX(task.getContent(), -dragDistanceNoChange, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(after.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(after.duration).toEqual(5);
});

test("reorder tasks from the timeline", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);

	const timelinePage = new TimelinePage(page);

	const taskOne = (await timelinePage.getTaskAtIndex(0)).getContent();
	const taskThree = (await timelinePage.getTaskAtIndex(2)).getContent();

	await dragElementOver(taskOne, taskThree, { page });

	const reorderedTask = await timelinePage.getTaskAtIndex(2);

	await expect(reorderedTask.getTitle()).toHaveText("More CMS Block Types");
});

test("cannot schedule a tasks start date to be after the task end date", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
	const timelinePage = new TimelinePage(page);

	const task = await timelinePage.getTaskAtIndex(0);
	const taskRect = await getBoundingClientRect(task.getTaskBar());
	const taskHandleStart = await task.getHandleStart();
	const dragDistance = taskRect.width * 2;

	await dragElementX(taskHandleStart, dragDistance, { page });

	const taskData = await task.getDetails();

	expect(taskData.duration).toEqual(1);
	expect(taskData.width).toBeGreaterThan(0);
});

test("cannot schedule a tasks end date cannot be before the task start date", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
	const timelinePage = new TimelinePage(page);

	const task = await timelinePage.getTaskAtIndex(0);
	const taskRect = await getBoundingClientRect(task.getTaskBar());
	const taskHandleEnd = await task.getHandleEnd();
	const dragDistance = taskRect.width * 2 * -1;

	await dragElementX(taskHandleEnd, dragDistance, { page });

	const taskData = await task.getDetails();

	expect(taskData.duration).toEqual(1);
	expect(taskData.width).toBeGreaterThan(0);
});

test("hides opposite task handle and tooltip when dragging a task over it", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
	const timelinePage = new TimelinePage(page);
	const task = await timelinePage.getTaskAtIndex(0);

	const taskHandleStart = await task.getHandleStart();

	const taskHandleEnd = await task.getHandleEnd();
	const taskHandleEndRect = await getBoundingClientRect(taskHandleEnd);

	await taskHandleStart.hover();
	await page.mouse.down();
	await page.mouse.move(taskHandleEndRect.x, taskHandleEndRect.y);

	await expect(page.locator(".taskDraggableHandle").nth(1)).not.toBeVisible();
	await expect(task.getTooltips().nth(1)).not.toBeVisible();
});

test("schedule a task with no date", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);

	const timelinePage = new TimelinePage(page);

	const task = page.locator(".taskWithoutDate").first();

	await clickElementCenter(task, { page });

	const taskScheduled = await timelinePage.getTaskAtIndex(3);

	const after = await taskScheduled.getDetails();
	expect(after.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(after.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(after.duration).toEqual(5);
});

test("schdeule a new task directly on the timeline", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);
	const timelinePage = new TimelinePage(page);

	const newTaskTimeline = timelinePage.getNewTaskTimeline();

	await hoverElementCenter(newTaskTimeline, { page });

	const placeholder = timelinePage.getNewTaskPlaceholder();
	await expect(placeholder).toBeVisible();

	await clickElementCenter(newTaskTimeline, { page });

	const expectedTaskName = "New task created on timeline";

	await page.keyboard.type(expectedTaskName);
	await page.keyboard.press("Enter");

	await expect(placeholder).not.toBeVisible();

	const newTask = await timelinePage.getTaskAtIndex(1);
	const newTaskDetails = await newTask.getDetails();

	// header range assertion
	const newTaskRect = await getBoundingClientRect(newTask.getTaskBar());

	const timelineBar = page.locator(".header .timelineBar");
	const timelineBarRect = await getBoundingClientRect(timelineBar);

	expect(timelineBarRect.left).toEqual(newTaskRect.left);
	expect(timelineBarRect.width).toEqual(newTaskRect.width);

	expect(newTaskDetails.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
	expect(newTaskDetails.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
	expect(newTaskDetails.duration).toEqual(5);

	await expect(newTask.getTitle()).toHaveText(expectedTaskName);
	await expect(newTask.getTooltips().nth(0)).toHaveText("Dec 30");
	await expect(newTask.getTooltips().nth(1)).toHaveText("Jan 03");
});

// test.skip("canvas scrolls on drag when autoScroll is active", () => {});
// test.skip("canvas does not scroll on drag when autoScroll is not active", () => {});
