import { Locator, Page } from "playwright";

const SELECTORS = {
	header: ".header",
	headerSticky: ".headerSticky",
	headerMonth: '[data-current="{month}"]',
	headerDay: ".header__day",
	zoomSelect: ".headerActions__zoom",
};

export class HeaderPage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async getData() {
		const header = this.getHeader();
		const headerData = await header.evaluate((el) => el.dataset);

		if (!headerData.gridWidth || isNaN(parseInt(headerData.gridWidth, 10))) {
			throw new Error(`Header is missing required data attributes or gridWidth is invalid: gridWidth=${headerData.gridWidth}`);
		}

		return {
			gridWidth: parseInt(headerData.gridWidth, 10),
		};
	}

	getHeader(): Locator {
		return this.page.locator(SELECTORS.header);
	}

	getTaskRange(): Locator {
		return this.page.locator(".header .timelineBar");
	}

	getMonth(month: string): Locator {
		return this.page.locator(SELECTORS.headerMonth.replace("{month}", month));
	}

	getDaysForMonth(month: string): Locator {
		return this.getMonth(month).locator(SELECTORS.headerDay);
	}

	getStickyMonth(): Locator {
		return this.page.locator(SELECTORS.headerSticky);
	}

	async setZoom(zoomLevel: string) {
		await this.page.locator(SELECTORS.zoomSelect).selectOption({
			value: zoomLevel,
		});
	}
}
