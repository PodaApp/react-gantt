import { Locator } from "playwright";

export class TaskPage {
	private readonly task: Locator;

	constructor(task: Locator) {
		this.task = task;
	}

	private async getTaskComputedData(el: Locator) {
		return await el.evaluate((element) => {
			const dataComputed = element.getAttribute("data-computed");
			return dataComputed ? JSON.parse(dataComputed) : null;
		});
	}

	private async computeTaskMeta() {
		const taskBar = this.task.locator(`.taskWithDate__bar`);
		const { dateStart, dateEnd, duration, width, x } = await this.getTaskComputedData(taskBar);

		return {
			title: await this.task.locator(`.taskContent__title`).nth(0).textContent(),
			dateStart: new Date(dateStart),
			dateEnd: new Date(dateEnd),
			duration,
			width,
			x,
		};
	}

	private async getTaskHandle(position: 0 | 1) {
		const handle = await this.task.locator(`.taskDraggableHandle`).nth(position);
		await handle.scrollIntoViewIfNeeded();
		await handle.hover();
		return handle;
	}

	async getHandleStart() {
		return this.getTaskHandle(0);
	}

	async getHandleEnd() {
		return this.getTaskHandle(1);
	}

	getContent() {
		return this.task.locator(`.taskContent`).nth(0);
	}

	getTaskBar() {
		return this.task.locator(`.taskWithDate__bar`);
	}

	getTitle() {
		return this.task.locator(`.taskContent__title`).nth(0);
	}

	getTooltips() {
		return this.task.locator(`.taskDraggableHandle__tooltip`);
	}

	async getDetails() {
		return this.computeTaskMeta();
	}

	isTaskWithNoDate() {
		return this.task.locator(`.taskWithoutDate`);
	}
}
