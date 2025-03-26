import { Locator, Page } from "playwright";

import { TaskPage } from "./TaskPage";

export class TimelinePage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async getProviderData() {
		const provider = this.page.locator("[data-testid='ganttContainer']");

		const { start, centered, end } = await provider.evaluate((el) => el.dataset);

		if (!start || !centered || !end) {
			throw new Error(`GanttProvider is missing required data attributes: start=${start}, centered=${centered}, end=${end}`);
		}

		return {
			start,
			centered,
			end,
		};
	}

	async setZoom(zoomLevel: string) {
		const zoomSelect = this.page.locator(".headerActions__zoom");

		await zoomSelect.selectOption({
			value: zoomLevel,
		});
	}

	async scrollBy(distance: number): Promise<void> {
		await this.getScrollableArea().evaluate((el, dist) => {
			el.scrollBy({ left: dist });
		}, distance);
	}

	async getTaskAtIndex(index: number) {
		const taskAtIndex = this.page.locator(`.task`).nth(index);
		if (!taskAtIndex) {
			throw new Error(`Task at index ${index} not found`);
		}

		return new TaskPage(taskAtIndex);
	}

	getMarkerToday(): Locator {
		return this.page.locator(".today");
	}

	getButtonToday(): Locator {
		return this.page.locator(".headerActions__today");
	}

	getStartOfMonthDividers(): Locator {
		return this.page.locator(`.firstOfTheMonth`);
	}

	getWeekendDividers() {
		return this.page.locator(`.weekend`);
	}

	getScrollableArea(): Locator {
		return this.page.locator(".gantt__scrollable");
	}

	getTaskTimeline(): Locator {
		return this.page.locator(".tasksTimeline");
	}

	getNewTaskTimeline(): Locator {
		return this.page.locator(".tasksTimeline__addNew");
	}

	getNewTaskPlaceholder(): Locator {
		return this.page.locator(".newTaskPlaceholder");
	}
}
