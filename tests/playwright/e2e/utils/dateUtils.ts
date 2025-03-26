import { addDays } from "date-fns";
import { Page } from "playwright";

import { HeaderPage } from "../pageObjects/HeaderPage";
import { TimelinePage } from "../pageObjects/TimelinePage";

export const getDateForOffset = async (offset: number, { page }: { page: Page }) => {
	const headerPage = new HeaderPage(page);
	const timelinePage = new TimelinePage(page);

	const providerData = await timelinePage.getProviderData();
	const headerData = await headerPage.getData();

	if (!headerData.gridWidth) {
		throw new Error("Missing required data attributes");
	}

	return addDays(new Date(providerData.start), offset / headerData.gridWidth);
};
