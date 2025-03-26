import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

import { GRID_WIDTH } from "../../../packages/core/src/constants";
import { tasksWithUnscheduled } from "./__fixtures__/tasks";
import { HeaderPage } from "./pageObjects/HeaderPage";
import { TaskPage } from "./pageObjects/TaskPage";
import { TimelinePage } from "./pageObjects/TimelinePage";
import { getBoundingClientRect } from "./utils/domUtils";
import { clickElementCenter, dragElementOver, dragElementX, hoverElementCenter } from "./utils/mouseUtils";

const halfGridUnit = GRID_WIDTH / 2;
const dragDistanceNoChange = halfGridUnit - 1;
const dragDistancePlusOne = halfGridUnit + 1;

export const ganttDateCentered = new Date(2025, 0, 1);

let timelinePage: TimelinePage;

async function verifyTaskDetails(task: TaskPage, expectedDetails: { dateStart: Date; dateEnd: Date; duration: number }) {
	const details = await task.getDetails();
	expect(details.dateStart).toEqual(expectedDetails.dateStart);
	expect(details.dateEnd).toEqual(expectedDetails.dateEnd);
	expect(details.duration).toEqual(expectedDetails.duration);
}

test.beforeEach(async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);
	timelinePage = new TimelinePage(page);
});

test.describe("Task date editing", () => {
	test("edit a tasks start date", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-29T14:00:00.000Z"),
			dateEnd: new Date("2025-01-02T14:00:00.000Z"),
			duration: 5,
		});

		await dragElementX(task.getHandleStart(), -dragDistancePlusOne, { page });

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-28T14:00:00.000Z"),
			dateEnd: new Date("2025-01-02T14:00:00.000Z"),
			duration: 6,
		});

		await expect(task.getTooltips().nth(0)).toHaveText("Dec 29");
	});

	test("task start date does not update until drag distance is greater than half a grid unit", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);

		await dragElementX(task.getHandleStart(), -dragDistanceNoChange, { page });

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-29T14:00:00.000Z"),
			dateEnd: new Date("2025-01-02T14:00:00.000Z"),
			duration: 5,
		});

		await expect(task.getTooltips().nth(1)).toHaveText("Jan 03");
	});

	test("edit a tasks end date", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-29T14:00:00.000Z"),
			dateEnd: new Date("2025-01-02T14:00:00.000Z"),
			duration: 5,
		});

		const taskHandleEnd = task.getHandleEnd();
		expect(taskHandleEnd).toHaveCount(1);

		await dragElementX(taskHandleEnd, dragDistancePlusOne, { page });

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-29T14:00:00.000Z"),
			dateEnd: new Date("2025-01-03T14:00:00.000Z"),
			duration: 6,
		});

		await expect(task.getTooltips().nth(1)).toHaveText("Jan 04");
	});

	test("task end date does not update until drag distance is greater than half a grid unit", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);

		await dragElementX(task.getHandleEnd(), dragDistanceNoChange, { page });

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-29T14:00:00.000Z"),
			dateEnd: new Date("2025-01-02T14:00:00.000Z"),
			duration: 5,
		});

		await expect(task.getTooltips().nth(1)).toHaveText("Jan 03");
	});

	test("reschedule a task maintaining its duration", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-29T14:00:00.000Z"),
			dateEnd: new Date("2025-01-02T14:00:00.000Z"),
			duration: 5,
		});

		await dragElementX(task.getContent(), -40, { page });

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-28T14:00:00.000Z"),
			dateEnd: new Date("2025-01-01T14:00:00.000Z"),
			duration: 5,
		});

		await expect(task.getTooltips().nth(0)).toHaveText("Dec 29");
		await expect(task.getTooltips().nth(1)).toHaveText("Jan 02");
	});

	test("task dates do not update until drag distance is greater than half a grid unit", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);

		await dragElementX(task.getContent(), -dragDistanceNoChange, { page });

		await verifyTaskDetails(task, {
			dateStart: new Date("2024-12-29T14:00:00.000Z"),
			dateEnd: new Date("2025-01-02T14:00:00.000Z"),
			duration: 5,
		});
	});
});

test.describe("Task reordering and constraints", () => {
	test("reorder tasks from the timeline", async ({ page }) => {
		const taskOne = (await timelinePage.getTaskAtIndex(0)).getContent();
		const taskThree = (await timelinePage.getTaskAtIndex(2)).getContent();

		await dragElementOver(taskOne, taskThree, { page });

		const reorderedTask = await timelinePage.getTaskAtIndex(2);

		await expect(reorderedTask.getTitle()).toHaveText("More CMS Block Types");
	});

	test("cannot schedule a tasks start date to be after the task end date", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);
		const taskRect = await getBoundingClientRect(task.getTaskBar());
		const taskHandleStart = task.getHandleStart();
		const dragDistance = taskRect.width * 2;

		await dragElementX(taskHandleStart, dragDistance, { page });

		const taskData = await task.getDetails();

		expect(taskData.duration).toEqual(1);
		expect(taskData.width).toBeGreaterThan(0);
	});

	test("cannot schedule a tasks end date cannot be before the task start date", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);
		const taskRect = await getBoundingClientRect(task.getTaskBar());
		const taskHandleEnd = task.getHandleEnd();
		const dragDistance = taskRect.width * 2 * -1;

		await dragElementX(taskHandleEnd, dragDistance, { page });

		const taskData = await task.getDetails();

		expect(taskData.duration).toEqual(1);
		expect(taskData.width).toBeGreaterThan(0);
	});

	test("hides opposite task handle and tooltip when dragging a task over it", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(0);

		const taskHandleStart = task.getHandleStart();

		const taskHandleEnd = task.getHandleEnd();
		const taskHandleEndRect = await getBoundingClientRect(taskHandleEnd);

		await taskHandleStart.hover();
		await page.mouse.down();
		await page.mouse.move(taskHandleEndRect.x, taskHandleEndRect.y);

		const oppositeHandle = await task.getTaskHandleAtIndex(1);
		await expect(oppositeHandle).not.toBeVisible();
		await expect(task.getTooltips().nth(1)).not.toBeVisible();
	});
});

test.describe("Task creation", () => {
	test("schedule a task with no date", async ({ page }) => {
		const task = await timelinePage.getTaskAtIndex(3);
		const taskTimeline = task.getTaskWithoutDate();

		await clickElementCenter(taskTimeline, { page });

		const taskScheduled = await timelinePage.getTaskAtIndex(3);

		const after = await taskScheduled.getDetails();
		expect(after.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
		expect(after.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
		expect(after.duration).toEqual(5);
	});

	test("schedule a new task directly on the timeline", async ({ page }) => {
		const newTaskTimeline = timelinePage.getNewTaskTimeline();

		await hoverElementCenter(newTaskTimeline, { page });

		const placeholder = timelinePage.getNewTaskPlaceholder();
		await expect(placeholder).toBeVisible();

		await clickElementCenter(newTaskTimeline, { page });

		const expectedTaskName = "New task created on timeline";

		await page.keyboard.type(expectedTaskName);
		await page.keyboard.press("Enter");

		await expect(placeholder).not.toBeVisible();

		const newTask = await timelinePage.getTaskAtIndex(4);
		const newTaskDetails = await newTask.getDetails();

		// header range assertion
		const newTaskRect = await getBoundingClientRect(newTask.getTaskBar());

		const headerPage = new HeaderPage(page);

		const taskRangeRect = await getBoundingClientRect(headerPage.getTaskRange());

		expect(taskRangeRect.left).toEqual(newTaskRect.left);
		expect(taskRangeRect.width).toEqual(newTaskRect.width);

		expect(newTaskDetails.dateStart).toEqual(new Date("2024-12-29T14:00:00.000Z"));
		expect(newTaskDetails.dateEnd).toEqual(new Date("2025-01-02T14:00:00.000Z"));
		expect(newTaskDetails.duration).toEqual(5);

		await expect(newTask.getTitle()).toHaveText(expectedTaskName);
		await expect(newTask.getTooltips().nth(0)).toHaveText("Dec 30");
		await expect(newTask.getTooltips().nth(1)).toHaveText("Jan 03");
	});
});
