import { Locator, Page } from "playwright";

export class TaskPage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;

		this.getTaskAtIndex = this.getTaskAtIndex.bind(this);
		this.getTaskById = this.getTaskById.bind(this);
	}

	private async getTaskComputedData(el: Locator) {
		return await el.evaluate((element) => {
			const dataComputed = element.getAttribute("data-computed");
			return dataComputed ? JSON.parse(dataComputed) : null;
		});
	}

	private async computeTaskMeta(el: Locator) {
		const taskBar = el.locator(`.taskWithDate__bar`);
		const { dateStart, dateEnd, duration, width, x } = await this.getTaskComputedData(taskBar);

		return {
			title: await el.locator(`.taskContent__title`).nth(0).textContent(),
			dateStart: new Date(dateStart),
			dateEnd: new Date(dateEnd),
			duration,
			width,
			x,
		};
	}

	private async getTaskHandle(el: Locator, position: 0 | 1) {
		const handle = await el.locator(`.taskDraggableHandle`).nth(position);
		await handle.scrollIntoViewIfNeeded();
		await handle.hover();
		return handle;
	}

	private getTaskData(el: Locator) {
		return {
			getHandleStart: () => this.getTaskHandle(el, 0),
			getHandleEnd: () => this.getTaskHandle(el, 1),
			getContent: () => el.locator(`.taskContent`).nth(0),
			getTaskBar: () => el.locator(`.taskWithDate__bar`),
			getTitle: () => el.locator(`.taskContent__title`).nth(0),
			getTooltips: () => el.locator(`.taskDraggableHandle__tooltip`),
			getDetails: () => this.computeTaskMeta(el),
			isTaskWithNoDate: () => el.locator(`.taskWithoutDate`),
		};
	}

	async getTaskAtIndex(index: number) {
		const taskAtIndex = await this.page.locator(`.task`).nth(index);
		if (!taskAtIndex) {
			throw new Error(`Task at index ${index} not found`);
		}
		return this.getTaskData(taskAtIndex);
	}

	async getTaskById(id: string) {
		const taskById = await this.page.locator(`.task[data-id="${id}"]`);
		if (!taskById) {
			throw new Error(`Task with id ${id} not found`);
		}
		return this.getTaskData(taskById);
	}
}
