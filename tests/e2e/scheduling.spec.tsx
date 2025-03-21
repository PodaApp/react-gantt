import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

import { tasksSingle, tasksWithUnscheduled } from "./__fixtures__/tasks";
import { clickElementCenter, dragElementOver, dragElementX } from "./utils/dragUtils";
import { tasksHelper } from "./utils/taskUtils";

export const ganttDateCentered = new Date(2025, 0, 1);

test("edit a tasks start date", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const { getTaskAtIndex } = tasksHelper({ page });

	const task = await getTaskAtIndex(0);

	const before = await task.getDetails();
	expect(before.dateStart).toEqual("2024-12-29T14:00:00.000Z");
	expect(before.dateEnd).toEqual("2025-01-02T14:00:00.000Z");
	expect(before.duration).toEqual(5);

	const taskHandleStart = await task.getHandleStart();
	await dragElementX(taskHandleStart, -42, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual("2024-12-28T14:00:00.000Z");
	expect(after.dateEnd).toEqual("2025-01-02T14:00:00.000Z");
	expect(after.duration).toEqual(6);

	await expect(task.getTooltips().nth(0)).toHaveText("Dec 29");
});

test("edit a tasks end date", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const { getTaskAtIndex } = tasksHelper({ page });

	const task = await getTaskAtIndex(0);

	const before = await task.getDetails();
	expect(before.dateStart).toEqual("2024-12-29T14:00:00.000Z");
	expect(before.dateEnd).toEqual("2025-01-02T14:00:00.000Z");
	expect(before.duration).toEqual(5);

	const taskHandleEnd = await task.getHandleEnd();
	await dragElementX(taskHandleEnd, 12, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual("2024-12-29T14:00:00.000Z");
	expect(after.dateEnd).toEqual("2025-01-03T14:00:00.000Z");
	expect(after.duration).toEqual(6);

	await expect(task.getTooltips().nth(1)).toHaveText("Jan 04");
});

test("reschedule a task maintaining its duration", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksSingle} dateCentered={ganttDateCentered} />);

	const { getTaskAtIndex } = tasksHelper({ page });

	const task = await getTaskAtIndex(0);

	const before = await task.getDetails();
	expect(before.dateStart).toEqual("2024-12-29T14:00:00.000Z");
	expect(before.dateEnd).toEqual("2025-01-02T14:00:00.000Z");
	expect(before.duration).toEqual(5);

	await dragElementX(task.getContent(), -80, { page });

	const after = await task.getDetails();
	expect(after.dateStart).toEqual("2024-12-28T14:00:00.000Z");
	expect(after.dateEnd).toEqual("2025-01-01T14:00:00.000Z");
	expect(after.duration).toEqual(5);

	await expect(task.getTooltips().nth(0)).toHaveText("Dec 29");
	await expect(task.getTooltips().nth(1)).toHaveText("Jan 02");
});

test("reorder tasks from the timeline", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);

	const { getTaskAtIndex } = tasksHelper({ page });

	const taskOne = (await getTaskAtIndex(0)).getContent();
	const taskThree = (await getTaskAtIndex(2)).getContent();

	await dragElementOver(taskOne, taskThree, { page });

	const reorderedTask = await getTaskAtIndex(2);

	await expect(reorderedTask.getTitle()).toHaveText("More CMS Block Types");
});

test("schedule a task with no date", async ({ page, mount }) => {
	await mount(<Gantt tasks={tasksWithUnscheduled} dateCentered={ganttDateCentered} />);

	const { getTaskAtIndex } = tasksHelper({ page });

	const task = page.locator(".taskWithoutDate").first();

	await clickElementCenter(task, { page });

	const taskScheduled = await getTaskAtIndex(3);

	const after = await taskScheduled.getDetails();
	expect(after.dateStart).toEqual("2024-12-29T14:00:00.000Z");
	expect(after.dateEnd).toEqual("2025-01-02T14:00:00.000Z");
	expect(after.duration).toEqual(5);

	await expect(taskScheduled.getTitle()).toHaveText("Task no date");
	await expect(taskScheduled.getTooltips().nth(0)).toHaveText("Dec 30");
	await expect(taskScheduled.getTooltips().nth(1)).toHaveText("Jan 03");
});

test.skip("shows the tasks under the mouse pointer when dragging", () => {});
test.skip("canvas scrolls on drag when autoScroll is active", () => {});
test.skip("canvas does not scroll on drag when autoScroll is not active", () => {});
