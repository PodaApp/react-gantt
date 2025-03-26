import { Locator, Page } from "playwright";

export class HeaderPage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async getHeaderData() {
		const header = this.getHeader();
		const headerData = await header.evaluate((el) => el.dataset);

		if (!headerData.gridWidth) {
			throw new Error(`Header is missing required data attributes: gridWidth=${headerData.gridWidth}`);
		}

		return {
			gridWidth: parseInt(headerData.gridWidth, 10),
		};
	}

	getHeader(): Locator {
		return this.page.locator(".header");
	}

	getHeaderMonth(month: string): Locator {
		return this.page.locator(`[data-current="${month}"]`);
	}

	getHeaderDaysForMonth(month: string): Locator {
		return this.getHeaderMonth(month).locator(".header__day");
	}

	getStickyMonth(): Locator {
		return this.page.locator(".headerSticky");
	}
}
