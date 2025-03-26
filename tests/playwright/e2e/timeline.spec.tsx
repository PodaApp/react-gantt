import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";
import { startOfDay } from "date-fns";

import { HeaderPage } from "./pageObjects/HeaderPage";
import { TimelinePage } from "./pageObjects/TimelinePage";
import { getDateForOffset } from "./utils/dateUtils";

export const ganttDateCentered = new Date(2025, 0, 1);

test("highlights today on the timeline", async ({ mount, page }) => {
	await mount(<Gantt tasks={[]} />);

	const timelinePage = new TimelinePage(page);

	const today = timelinePage.getMarkerToday();
	const todayData = await today.evaluate((el) => el.dataset);

	if (!todayData.offset) {
		throw new Error(`Today element is missing required data attributes: offset=${todayData.offset}`);
	}

	const date = await getDateForOffset(parseInt(todayData.offset, 10), { page });

	await expect(today).toBeVisible();
	expect(date).toEqual(startOfDay(new Date().toUTCString()));
});
test("sticks the month to the left when the timeline is scrolled", async ({ mount, page }) => {
	await mount(<Gantt tasks={[]} dateCentered={ganttDateCentered} />);
	const timelinePage = new TimelinePage(page);
	const headerPage = new HeaderPage(page);

	const timeline = await timelinePage.getScrollableArea();

	await timeline.hover();
	await timelinePage.scrollBy(-500);
	await expect(headerPage.getStickyMonth()).toHaveText("December 2024");

	await timelinePage.scrollBy(-500);
	await expect(headerPage.getStickyMonth()).toHaveText("November 2024");
});
