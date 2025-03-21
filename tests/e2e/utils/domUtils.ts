import { Locator } from "playwright";

export const getBoundingClientRect = async (el: Locator) => {
	return await el.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		return {
			x: rect.x,
			y: rect.y,
			width: rect.width,
			height: rect.height,
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
			left: rect.left,
		};
	});
};
