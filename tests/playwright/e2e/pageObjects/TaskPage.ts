import { Locator } from "playwright";

const SELECTORS = {
	taskBar: ".taskWithDate__bar",
	taskTitle: ".taskContent__title",
	taskContent: ".taskContent",
	taskTooltip: ".taskDraggableHandle__tooltip",
	taskHandle: ".taskDraggableHandle",
	taskWithoutDate: ".taskWithoutDate",
};

export class TaskPage {
	private readonly task: Locator;

	constructor(task: Locator) {
		this.task = task;
	}

	private async getTaskComputedData(el: Locator) {
		return await el.evaluate((element) => {
			const taskData = element.getAttribute("data-computed");

			if (!taskData) {
				throw new Error("data-computed attribute is missing");
			}

			return JSON.parse(taskData);
		});
	}

	private async getTaskMeta() {
		const taskBar = this.task.locator(SELECTORS.taskBar);
		const { dateStart, dateEnd, duration, width, x } = await this.getTaskComputedData(taskBar);

		const title = await this.task.locator(SELECTORS.taskTitle).nth(0).textContent();

		return {
			title,
			dateStart: new Date(dateStart),
			dateEnd: new Date(dateEnd),
			duration,
			width,
			x,
		};
	}

	private async getTaskHandle(position: 0 | 1) {
		const handle = await this.task.locator(SELECTORS.taskHandle).nth(position);
		await handle.scrollIntoViewIfNeeded();
		await handle.hover();
		return handle;
	}

	getHandleStart() {
		return this.getTaskHandle(0);
	}

	getHandleEnd() {
		return this.getTaskHandle(1);
	}

	getContent() {
		return this.task.locator(SELECTORS.taskContent).nth(0);
	}

	getTaskBar() {
		return this.task.locator(SELECTORS.taskBar);
	}

	getTitle() {
		return this.task.locator(SELECTORS.taskTitle).nth(0);
	}

	getTooltips() {
		return this.task.locator(SELECTORS.taskTooltip);
	}

	getDetails() {
		return this.getTaskMeta();
	}

	getTaskWithoutDate() {
		return this.task.locator(SELECTORS.taskWithoutDate);
	}
}
