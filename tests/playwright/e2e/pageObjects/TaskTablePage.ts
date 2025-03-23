import { Locator, Page } from "playwright";

export class TaskTablePage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;

		this.getTaskAtIndex = this.getTaskAtIndex.bind(this);
		this.getAllTasks = this.getAllTasks.bind(this);
		this.getNewTaskButton = this.getNewTaskButton.bind(this);
		this.getToggleButton = this.getToggleButton.bind(this);
	}

	async getTaskAtIndex(index: number) {
		const taskAtIndex = await this.page.locator(`.taskTableTask`).nth(index);
		if (!taskAtIndex) {
			throw new Error(`Task at index ${index} not found`);
		}
		return this.getTaskData(taskAtIndex);
	}

	getAllTasks() {
		return this.page.locator(`.taskTableTask`);
	}

	getNewTaskButton() {
		return this.page.locator(`.taskTable .newTaskButton`);
	}

	getToggleButton() {
		return this.page.locator(`.buttonTaskTableOpen`);
	}

	private getTaskData(el: Locator) {
		return {
			getTitle: () => el.locator(`.taskTableTask__title`),
			getTitleInput: () => el.locator(`.taskTableTask__textarea`),
			getSortHandle: () => this.getTaskAction(el, "sort"),
			getAddTaskButton: () => this.getTaskAction(el, "add"),
		};
	}

	private async getTaskAction(el: Locator, action: "sort" | "add") {
		await el.hover();

		switch (action) {
			case "sort": {
				return el.locator(`.taskTableTask__action`).nth(1);
			}
			case "add": {
				return el.locator(`.taskTableTask__action`).nth(0);
			}
		}
	}
}
