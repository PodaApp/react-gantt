import { Locator, Page } from "playwright";

const SELECTORS = {
	task: ".taskTableTask",
	taskTitle: ".taskTableTask__title",
	taskTextarea: ".taskTableTask__textarea",
	taskAction: ".taskTableTask__action",
	newTaskButton: ".taskTable .newTaskButton",
	toggleButton: ".buttonTaskTableOpen",
};

export class TaskTablePage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	private getTaskData(el: Locator) {
		return {
			getTitle: () => el.locator(SELECTORS.taskTitle),
			getTitleInput: () => el.locator(SELECTORS.taskTextarea),
			getSortHandle: () => this.getTaskAction(el, "sort"),
			getAddTaskButton: () => this.getTaskAction(el, "add"),
		};
	}

	private async getTaskAction(el: Locator, action: "sort" | "add") {
		await el.hover();

		switch (action) {
			case "sort": {
				return el.locator(SELECTORS.taskAction).nth(1);
			}
			case "add": {
				return el.locator(SELECTORS.taskAction).nth(0);
			}
		}
	}

	async getTaskAtIndex(index: number) {
		const taskAtIndex = await this.page.locator(SELECTORS.task).nth(index);
		if (!taskAtIndex) {
			throw new Error(`Task at index ${index} not found`);
		}
		return this.getTaskData(taskAtIndex);
	}

	getAllTasks() {
		return this.page.locator(SELECTORS.task);
	}

	getNewTaskButton() {
		return this.page.locator(SELECTORS.newTaskButton);
	}

	getToggleButton() {
		return this.page.locator(SELECTORS.toggleButton);
	}
}
