import { Gantt } from "@nikglavin/react-gantt";
import { expect, test } from "@playwright/experimental-ct-react";
import { differenceInDays } from "date-fns";

import { tasksSingle } from "./__fixtures__/tasks";
import { HeaderPage } from "./pageObjects/HeaderPage";
import { TimelinePage } from "./pageObjects/TimelinePage";
import { getDateForOffset } from "./utils/dateUtils";
import { isOnscreen } from "./utils/domUtils";

const dateCentered = new Date(2025, 0, 1);

test.describe("Zoom functionality", () => {
	let headerPage: HeaderPage;
	let timelinePage: TimelinePage;

	test.beforeEach(async ({ mount, page }) => {
		await mount(<Gantt tasks={tasksSingle} dateCentered={dateCentered} />);
		headerPage = new HeaderPage(page);
		timelinePage = new TimelinePage(page);
	});

	test("displays daily dates at week zoom level", async () => {
		const days = await headerPage.getDaysForMonth("January 2025");
		const dayCount = await days.count();

		expect(dayCount).toBe(31);

		for (let i = 0; i < dayCount; i++) {
			const day = days.nth(i);
			const dayText = await day.textContent();
			expect(dayText?.trim()).toBe((i + 1).toString());
		}
	});

	test("displays only Mondays at month zoom level", async () => {
		await timelinePage.setZoom("month");

		const days = await headerPage.getDaysForMonth("January 2025");
		const mondays = await days.evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim()).filter(Boolean));

		expect(mondays).toHaveLength(4);
		expect(mondays).toEqual(["6", "13", "20", "27"]);
	});

	test("renders weekend dividers at week zoom level", async ({ page }) => {
		const weekendDividers = timelinePage.getWeekendDividers();

		const expectedWeekendCount = 52;
		await expect(weekendDividers).toHaveCount(expectedWeekendCount);

		const midPoint = weekendDividers.nth(26);
		const midPointOffset = await midPoint.evaluate((el) => el.dataset.offset);
		const midPointDate = await getDateForOffset(parseInt(midPointOffset!, 10), { page });

		expect(midPointDate).toEqual(new Date(2025, 0, 4));
	});

	test("renders start-of-month dividers at month zoom level", async ({ page }) => {
		await timelinePage.setZoom("month");
		const startOfMonthDividers = timelinePage.getStartOfMonthDividers();

		await expect(startOfMonthDividers).toHaveCount(25);

		const midPoint = startOfMonthDividers.nth(13);
		const midPointOffset = await midPoint.evaluate((el) => el.dataset.offset);

		expect(midPointOffset).not.toBeNull();

		const midPointDate = await getDateForOffset(parseInt(midPointOffset!, 10), { page });

		expect(midPointDate).toEqual(new Date(2025, 0, 1));
	});

	test("preserves centered date when zoom level changes", async () => {
		const timelineDataWeek = await timelinePage.getProviderData();

		await timelinePage.setZoom("month");

		const timelineDataMonth = await timelinePage.getProviderData();

		const actualDaysToCenter = differenceInDays(timelineDataWeek.centered, timelineDataMonth.centered);

		expect(actualDaysToCenter).toBeGreaterThan(-3);
		expect(actualDaysToCenter).toBeLessThan(3);
	});

	test("adjusts task sizes to match zoom level", async ({ page }) => {
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

	test("updates rendered duration based on zoom level", async () => {
		const timelineDataWeek = await timelinePage.getProviderData();
		const weekLengthInDays = differenceInDays(timelineDataWeek.end, timelineDataWeek.start);

		const expectedDayRangeWeek = 365;
		expect(weekLengthInDays).toBe(expectedDayRangeWeek);

		await timelinePage.setZoom("month");
		const timelineDataMonth = await timelinePage.getProviderData();
		const monthLengthInDays = differenceInDays(timelineDataMonth.end, timelineDataMonth.start);

		const expectedDayRangeMonth = 760;
		expect(monthLengthInDays).toBe(expectedDayRangeMonth);

		await timelinePage.setZoom("quarter");
		const timelineDataQuarter = await timelinePage.getProviderData();
		const quarterLengthInDays = differenceInDays(timelineDataQuarter.end, timelineDataQuarter.start);

		const expectedDayRangeQuarter = 1792;
		expect(quarterLengthInDays).toBe(expectedDayRangeQuarter);

		await timelinePage.setZoom("year");
		const timelineDataYear = await timelinePage.getProviderData();
		const yearLengthInDays = differenceInDays(timelineDataYear.end, timelineDataYear.start);

		const expectedDayRangeYear = 2947;
		expect(yearLengthInDays).toBe(expectedDayRangeYear);
	});
});

test.describe("Today marker", () => {
	let timelinePage: TimelinePage;

	test.beforeEach(async ({ mount, page }) => {
		await mount(<Gantt tasks={[]} />);
		timelinePage = new TimelinePage(page);
	});

	test("centers the timeline on today's date when clicked", async () => {
		const timeline = await timelinePage.getScrollableArea();

		await expect(isOnscreen(timeline, timelinePage.getMarkerToday())).resolves.toEqual(true);

		await timelinePage.scrollBy(-2000);

		await expect(isOnscreen(timeline, timelinePage.getMarkerToday())).resolves.toEqual(false);

		await timelinePage.getButtonToday().click();

		await expect(isOnscreen(timeline, timelinePage.getMarkerToday())).resolves.toEqual(true);
	});
});
