import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";
import { addDays, differenceInDays } from "date-fns";
import { Locator, Page } from "playwright";

import { tasksSingle } from "./__fixtures__/tasks";
import { HeaderPage } from "./pageObjects/HeaderPage";
import { TimelinePage } from "./pageObjects/TimelinePage";

const dateCentered = new Date(2025, 0, 1);

// TODO: Duplicate code
const getDateForOffset = async (offset: number, { page }: { page: Page }) => {
	const headerPage = new HeaderPage(page);
	const timelinePage = new TimelinePage(page);

	const providerData = await timelinePage.getProviderData();
	const headerData = await headerPage.getHeaderData();

	if (!headerData.gridWidth) {
		throw new Error("Missing required data attributes");
	}

	return addDays(new Date(providerData.start), offset / headerData.gridWidth);
};

const isOnscreen = async (container: Locator, element: Locator) => {
	const containerBox = await container.boundingBox();
	const elementBox = await element.boundingBox();

	if (!containerBox || !elementBox) return false; // Handle case where bounding box isn't available

	return (
		elementBox.x + elementBox.width > containerBox.x && // Not completely left
		elementBox.x < containerBox.x + containerBox.width // Not completely right
	);
};

test.describe("zoom", () => {
	test("shows each the date for day when the zoom is set to week", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={dateCentered} />);
		const headerPage = new HeaderPage(page);

		const days = await headerPage.getHeaderDaysForMonth("January 2025");
		const dayCount = await days.count();

		expect(dayCount).toBe(31);

		for (let i = 0; i < dayCount; i++) {
			const day = days.nth(i);
			const dayText = await day.textContent();
			expect(dayText?.trim()).toBe((i + 1).toString());
		}
	});
	test("shows only the dates for mondays when the zoom is set to greater than week", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={dateCentered} />);
		const timelinePage = new TimelinePage(page);
		const headerPage = new HeaderPage(page);

		await timelinePage.setZoom("month");

		const days = await headerPage.getHeaderDaysForMonth("January 2025");
		const dayCount = await days.count();

		const mondays = [];

		for (let i = 0; i < dayCount; i++) {
			const day = days.nth(i);
			const dayText = await day.textContent();
			if (dayText) {
				mondays.push(dayText.trim());
			}
		}

		expect(mondays).toHaveLength(4);
		expect(mondays).toEqual(["6", "13", "20", "27"]);
	});

	test("shows weekend when the zoom is set to week ", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={dateCentered} />);
		const timelinePage = new TimelinePage(page);
		const weekendDividers = timelinePage.getWeekendDividers();

		await expect(weekendDividers).toHaveCount(52);

		const midPoint = weekendDividers.nth(26);
		const midPointOffset = await midPoint.evaluate((el) => el.dataset.offset);
		const midPointDate = await getDateForOffset(parseInt(midPointOffset!, 10), { page });

		expect(midPointDate).toEqual(new Date(2025, 0, 4));
	});
	test("shows first of the month when zoom is set to greater than a week", async ({ page, mount }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={dateCentered} />);
		const timelinePage = new TimelinePage(page);

		await timelinePage.setZoom("month");
		const startOfMonthDividers = timelinePage.getStartOfMonthDividers();

		await expect(startOfMonthDividers).toHaveCount(25);

		const midPoint = startOfMonthDividers.nth(13);
		const midPointOffset = await midPoint.evaluate((el) => el.dataset.offset);
		const midPointDate = await getDateForOffset(parseInt(midPointOffset!, 10), { page });

		expect(midPointDate).toEqual(new Date(2025, 0, 1));
	});
	test("the date centered on the timeline does not change when the zoom level changes", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={dateCentered} />);
		const timelinePage = new TimelinePage(page);

		const timelineDataWeek = await timelinePage.getProviderData();

		await timelinePage.setZoom("month");

		const timelineDataMonth = await timelinePage.getProviderData();

		const actualDaysToCenter = differenceInDays(timelineDataWeek.centered, timelineDataMonth.centered);

		// Expect within in range of -3 to 3 days
		expect(actualDaysToCenter).toBeGreaterThan(-3);
		expect(actualDaysToCenter).toBeLessThan(3);
	});
	test.skip("updating the zoom calculates the date range of the timeline based on the date centered in the viewport", () => {});
	test("task sizes are adjusted to fit the zoom level", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={dateCentered} />);
		const timelinePage = new TimelinePage(page);

		const taskWeek = await timelinePage.getTaskAtIndex(0);
		const taskWeekData = await taskWeek.getDetails();
		const dateWeek = await getDateForOffset(taskWeekData.x, { page });

		expect(taskWeekData.width).toBe(200);

		await timelinePage.setZoom("month");

		const taskMonth = await timelinePage.getTaskAtIndex(0);
		const taskMonthData = await taskMonth.getDetails();
		const dateMonth = await getDateForOffset(taskMonthData.x, { page });

		expect(taskMonthData.width).toBe(100);
		expect(dateMonth).toEqual(dateWeek);
	});
	test("the total rendered duration of the timeline changes based on the zoom level", async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={dateCentered} />);
		const timelinePage = new TimelinePage(page);

		const timelineDataWeek = await timelinePage.getProviderData();
		const weekLengthInDays = differenceInDays(timelineDataWeek.end, timelineDataWeek.start);
		expect(weekLengthInDays).toBe(365);

		await timelinePage.setZoom("month");
		const timelineDataMonth = await timelinePage.getProviderData();
		const monthLengthInDays = differenceInDays(timelineDataMonth.end, timelineDataMonth.start);
		expect(monthLengthInDays).toBe(760);

		await timelinePage.setZoom("quarter");
		const timelineDataQuarter = await timelinePage.getProviderData();
		const quarterLengthInDays = differenceInDays(timelineDataQuarter.end, timelineDataQuarter.start);
		expect(quarterLengthInDays).toBe(1792);

		await timelinePage.setZoom("year");
		const timelineDataYear = await timelinePage.getProviderData();
		const yearLengthInDays = differenceInDays(timelineDataYear.end, timelineDataYear.start);
		expect(yearLengthInDays).toBe(2947);
	});

	test.skip("the focused task duration only shows start and end dates when the zoom level is greater than week", () => {});
});

test.describe("today", () => {
	test("centers the timeline on todays date when today is clicked", async ({ mount, page }) => {
		await mount(<Gantt tasks={[]} />);
		const timelinePage = new TimelinePage(page);
		const timeline = await timelinePage.getScrollableArea();

		const today = () => page.locator(".today");

		await expect(isOnscreen(timeline, today())).resolves.toEqual(true);

		await timelinePage.scrollBy(-2000);

		await expect(isOnscreen(timeline, today())).resolves.toEqual(false);

		await timelinePage.getButtonToday().click();

		await expect(isOnscreen(timeline, today())).resolves.toEqual(true);
	});
});
