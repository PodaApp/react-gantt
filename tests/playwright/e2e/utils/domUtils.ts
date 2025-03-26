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

export const isTextTruncated = (el: Locator) => el.evaluate((el) => el.scrollWidth > el.clientWidth);

export const isOnscreen = async (container: Locator, element: Locator): Promise<boolean> => {
	const [containerBox, elementBox] = await Promise.all([container.boundingBox(), element.boundingBox()]);

	if (!containerBox || !elementBox) {
		return false;
	}

	const elementRightEdge = elementBox.x + elementBox.width;
	const containerRightEdge = containerBox.x + containerBox.width;

	const isWithinLeftBound = elementRightEdge > containerBox.x;
	const isWithinRightBound = elementBox.x < containerRightEdge;

	return isWithinLeftBound && isWithinRightBound;
};
