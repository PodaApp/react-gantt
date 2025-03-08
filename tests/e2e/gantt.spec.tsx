import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

const GRID_WIDTH = 40;

test.describe("Scheduling", () => {
	test("can edit the start date", async ({ page, mount }) => {
		const component = await mount(<Gantt />);

		const node = component.locator(`.taskDraggableHandle`).first();
		const box = await node.boundingBox();

		if (!box) throw new Error("Element not found");

		await node.hover();
		await page.mouse.down();
		await page.mouse.move(box.x - 42, box.y);
		await page.mouse.up();

		await node.hover();

		const expectedStartDate = "Feb 28";
		const tooltip = node.locator(`text=${expectedStartDate}`);
		await expect(tooltip).toBeVisible();
	});
	test.skip("can edit the end date", () => {});
	test.skip("can reschedule a task maintaining its duration", () => {});
	test.skip("can schedule a task with no date", () => {});
	test.skip("can change the rank of a task", () => {});
	test.skip("hovering over the start handle shows the start date", async ({ mount }) => {
		const component = await mount(<Gantt />);

		const node = component.locator(`.taskDraggableHandle`).first();
		await node.hover();

		const expectedStartDate = "Mar 01";
		const tooltip = node.locator(`text=${expectedStartDate}`);

		await expect(tooltip).toBeVisible();
	});
	test.skip("hovering over the end date shows the end date", () => {});
});
