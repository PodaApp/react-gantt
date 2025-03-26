import { Locator, Page } from "playwright";

import { TaskPage } from "./TaskPage";

const SELECTORS = {
	ganttContainer: "[data-testid='ganttContainer']",
	todayMarker: ".today",
	todayButton: ".headerActions__today",
	monthDividers: ".firstOfTheMonth",
	weekendDividers: ".weekend",
	scrollableArea: ".gantt__scrollable",
	taskTimeline: ".tasksTimeline",
	newTaskTimeline: ".tasksTimeline__addNew",
	newTaskPlaceholder: ".newTaskPlaceholder",
	task: ".task",
	zoomSelect: ".headerActions__zoom",
};

export class TimelinePage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async getProviderData() {
		const provider = this.page.locator(SELECTORS.ganttContainer);

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
		await this.page.locator(SELECTORS.zoomSelect).selectOption({
			value: zoomLevel,
		});
	}

	async scrollBy(distance: number): Promise<void> {
		await this.getScrollableArea().evaluate((el, dist) => {
			el.scrollBy({ left: dist });
		}, distance);
	}

	async getTaskAtIndex(index: number) {
		const taskAtIndex = this.page.locator(SELECTORS.task).nth(index);
		if (!taskAtIndex) {
			throw new Error(`Task at index ${index} not found`);
		}

		return new TaskPage(taskAtIndex);
	}

	getMarkerToday(): Locator {
		return this.page.locator(SELECTORS.todayMarker);
	}

	getButtonToday(): Locator {
		return this.page.locator(SELECTORS.todayButton);
	}

	getStartOfMonthDividers(): Locator {
		return this.page.locator(SELECTORS.monthDividers);
	}

	getWeekendDividers() {
		return this.page.locator(SELECTORS.weekendDividers);
	}

	getScrollableArea(): Locator {
		return this.page.locator(SELECTORS.scrollableArea);
	}

	getTaskTimeline(): Locator {
		return this.page.locator(SELECTORS.taskTimeline);
	}

	getNewTaskTimeline(): Locator {
		return this.page.locator(SELECTORS.newTaskTimeline);
	}

	getNewTaskPlaceholder(): Locator {
		return this.page.locator(SELECTORS.newTaskPlaceholder);
	}
}
