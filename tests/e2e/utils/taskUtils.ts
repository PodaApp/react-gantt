import { Locator } from "playwright";

import { PlaywrightContext } from "./types";

const _getTaskComputedData = async (el: Locator) => {
	return await el.evaluate((element) => {
		const dataComputed = element.getAttribute("data-computed");
		return dataComputed ? JSON.parse(dataComputed) : null;
	});
};

const _computeTaskMeta = async (el: Locator) => {
	const taskBar = el.locator(`.taskWithDate__bar`);

	const { dateStart, dateEnd, duration, width, x } = await _getTaskComputedData(taskBar);

	return {
		title: await el.locator(`.taskContent__title`).nth(0).textContent(),
		dateStart: new Date(dateStart),
		dateEnd: new Date(dateEnd),
		duration,
		width,
		x,
	};
};

const _getTaskHandle = async (el: Locator, position: 0 | 1) => {
	const handle = await el.locator(`.taskDraggableHandle`).nth(position);
	await handle.scrollIntoViewIfNeeded();
	await handle.hover();

	return handle;
};

const _getTaskData = (el: Locator) => {
	return {
		getHandleStart: () => _getTaskHandle(el, 0),
		getHandleEnd: () => _getTaskHandle(el, 1),
		getContent: () => el.locator(`.taskContent`).nth(0),
		getTaskBar: () => el.locator(`.taskContent__bar`),
		getTitle: () => el.locator(`.taskContent__title`).nth(0),
		getTooltips: () => el.locator(`.taskDraggableHandle__tooltip`),
		getDetails: () => _computeTaskMeta(el),
		isTaskWithNoDate: () => el.locator(`.taskWithoutDate`),
	};
};

const _getTaskAtIndex = async (index: number, { page }: PlaywrightContext) => {
	const taskAtIndex = await page.locator(`.task`).nth(index);

	if (!taskAtIndex) {
		throw new Error(`Task at index ${index} not found`);
	}

	return _getTaskData(taskAtIndex);
};

const _getTaskById = async (id: string, { page }: PlaywrightContext) => {
	const taskById = await page.locator(`.task[data-id="${id}"]`);

	if (!taskById) {
		throw new Error(`Task with id ${id} not found`);
	}

	return _getTaskData(taskById);
};

export const tasksHelper = ({ page }: PlaywrightContext) => {
	return {
		getTaskAtIndex: (index: number) => _getTaskAtIndex(index, { page }),
		getTaskById: (id: string) => _getTaskById(id, { page }),
	};
};
