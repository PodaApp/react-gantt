import { Locator } from "playwright";

import { PlaywrightContext } from "./types";

export const tasksTableHelper = ({ page }: PlaywrightContext) => {
	return {
		getTaskAtIndex: (index: number) => _getTaskAtIndex(index, { page }),
		getAllTasks: () => page.locator(`.taskTableTask`),
		getNewTaskButton: () => page.locator(`.taskTable .newTaskButton`),
		getToggleButton: () => page.locator(`.buttonTaskTableOpen`),
	};
};

const _getTaskAtIndex = async (index: number, { page }: PlaywrightContext) => {
	const taskAtIndex = await page.locator(`.taskTableTask`).nth(index);

	if (!taskAtIndex) {
		throw new Error(`Task at index ${index} not found`);
	}

	return _getTaskData(taskAtIndex);
};

const _getTaskData = (el: Locator) => {
	return {
		getTitle: () => el.locator(`.taskTableTask__title`),
		getTitleInput: () => el.locator(`.taskTableTask__textarea`),
		getSortHandle: () => _getTaskAction(el, "sort"),
		getAddTaskButton: () => _getTaskAction(el, "add"),
	};
};

const _getTaskAction = async (el: Locator, action: "sort" | "add") => {
	await el.hover();

	switch (action) {
		case "sort": {
			return el.locator(`.taskTableTask__action`).nth(1);
		}
		case "add": {
			return el.locator(`.taskTableTask__action`).nth(0);
		}
	}
};
