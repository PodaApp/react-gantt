import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

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

// TODO: Create a page object for easier assertions on tasks
// - Fix end date adjustment errors
// - Fix snapping when updating task durations

test.describe("scheduling", () => {
	test("edit a tasks start date", async ({ page, mount }) => {
		const component = await mount(<Gantt />);

		const node = component.locator(`.taskDraggableHandle`).first();
		await node.hover();
		await page.mouse.down();

		const box = await node.boundingBox();
		if (!box) throw new Error("Element not found");

		// TODO: Need to remove magic number for movement
		await page.mouse.move(box.x - 42, box.y);
		await page.mouse.up();

		await node.hover();

		const expectedStartDate = "Mar 09";
		const tooltip = node.locator(".taskDraggableHandle__tooltip");
		await expect(tooltip).toHaveText(expectedStartDate);
	});

	test("edit a tasks end date", async ({ page, mount }) => {
		const component = await mount(<Gantt />);

		const node = component.locator(`.taskDraggableHandle`).nth(1);
		await node.hover();
		await page.mouse.down();

		const box = await node.boundingBox();
		if (!box) throw new Error("Element not found");

		// TODO: Need to remove magic number for movement
		await page.mouse.move(box.x + 5, box.y);
		await page.mouse.up();

		await node.hover();

		const expectedStartDate = "Mar 15";
		const tooltip = node.locator(".taskDraggableHandle__tooltip");

		await expect(tooltip).toHaveText(expectedStartDate);
	});

	test("reschedule a task maintaining its duration", async ({ page, mount }) => {
		const component = await mount(<Gantt />);

		const node = component.locator(`.taskContent`).first();
		await node.hover();
		await page.mouse.down();

		const box = await node.boundingBox();
		if (!box) throw new Error("Element not found");

		// Need to trigger two mouse events as the DnD setup is using a
		// activation constraint and wont fire
		const boxCenterX = box.x + box.width / 2;
		const boxCenterY = box.y + box.height / 2;

		const ACTIVATION_CONSTRAINT = 10;
		const GRID_WIDTH = 80;

		await page.mouse.move(boxCenterX - ACTIVATION_CONSTRAINT, boxCenterY);
		await page.mouse.move(boxCenterX - ACTIVATION_CONSTRAINT - GRID_WIDTH, boxCenterY);

		await page.mouse.up();

		const nodeStart = component.locator(`.taskDraggableHandle`).nth(0);
		await nodeStart.scrollIntoViewIfNeeded();
		await nodeStart.hover();

		const startDate = nodeStart.locator(`text=Mar 09`);
		await expect(startDate).toBeVisible();

		const nodeEnd = component.locator(`.taskDraggableHandle`).nth(1);
		await nodeEnd.scrollIntoViewIfNeeded();
		await nodeEnd.hover();

		const endDate = nodeEnd.locator(`text=Mar 13`);
		await expect(endDate).toBeVisible();
	});

	test("reorder tasks from the timeline", async ({ page, mount }) => {
		const component = await mount(<Gantt />);

		const node = component.locator(`.taskContent`).first();
		await node.hover();
		await page.mouse.down();

		const box = await node.boundingBox();
		if (!box) throw new Error("Element not found");

		// Need to trigger two mouse events as the DnD setup is using a
		// activation constraint and wont fire
		const boxCenterX = box.x + box.width / 2;
		const boxCenterY = box.y + box.height / 2;

		const ACTIVATION_CONSTRAINT = 10;

		await page.mouse.move(boxCenterX, boxCenterY + ACTIVATION_CONSTRAINT);

		const overNode = component.locator(`.taskContent`).nth(2);

		const overBox = await overNode.boundingBox();
		if (!overBox) throw new Error("Element not found");

		const overCenterY = overBox.y + overBox.height / 2;

		await page.mouse.move(boxCenterX, overCenterY);
		await page.mouse.up();
		await page.waitForTimeout(200);

		const nodeNewPosition = component.locator(`.taskContent`).nth(2);
		const taskText = nodeNewPosition.locator(".taskContent__title").first();
		await expect(taskText).toHaveText("More CMS Block Types");
	});

	// TODO: This test isn't idempotent as the center point of the chart is constantly changing
	// So the asserted dates can't be accuratly determined
	test("schedule a task with no date", async ({ page, mount }) => {
		const component = await mount(<Gantt />);
		const task = component.locator(".taskWithoutDate").first();

		const box = await task.boundingBox();
		if (!box) throw new Error("Element not found");

		const boxCenterX = box.x + box.width / 2;
		const boxCenterY = box.y + box.height / 2;

		// Rather than clicking here maybe i should move the mouse and assert that the placeholder
		// is rendered based on the mouses current position
		await page.mouse.click(boxCenterX, boxCenterY);

		// When using timelineBar as a selector it also picks up the header range element
		const taskWithDate = component.locator(`.timelineBar`).nth(4);
		const taskWithDateText = taskWithDate.locator(":scope .taskContent__title").first();
		await expect(taskWithDateText).toHaveText("Task no date");

		const taskStartHandle = taskWithDate.locator(".taskDraggableHandle").nth(0);
		await taskStartHandle.hover();

		const startDate = taskStartHandle.locator(`text=Mar 17`);
		await expect(startDate).toBeVisible();

		const taskEndHandle = taskWithDate.locator(".taskDraggableHandle").nth(1);
		await taskEndHandle.hover();

		const endDate = taskEndHandle.locator(`text=Mar 21`);
		await expect(endDate).toBeVisible();
	});
});
