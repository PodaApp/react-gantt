import { Locator, Page } from "playwright";

import { TaskPage } from "./TaskPage";

export class TimelinePage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;

		this.getScrollableArea = this.getScrollableArea.bind(this);
		this.getNewTaskTimeline = this.getNewTaskTimeline.bind(this);
		this.scrollBy = this.scrollBy.bind(this);
	}

	getScrollableArea(): Locator {
		return this.page.locator(".gantt__scrollable");
	}

	getNewTaskTimeline(): Locator {
		return this.page.locator(".tasksTimeline__addNew");
	}

	getNewTaskPlaceholder(): Locator {
		return this.page.locator(".newTaskPlaceholder");
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
}
