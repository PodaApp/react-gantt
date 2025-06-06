import { Locator } from "playwright";

import { PlaywrightContext } from "./types";

// Need to trigger two mouse events as the DnD setup is using a
// activation constraint and wont fire
const ACTIVATION_CONSTRAINT = 10;

const _getCenter = async (el: Locator) => {
	const box = await el.boundingBox();
	if (!box) throw new Error("Element not found");

	return {
		x: box.x + box.width / 2,
		y: box.y + box.height / 2,
		width: box.width,
	};
};

type DragOptions = {
	mouseUp?: boolean;
} & PlaywrightContext;

export const dragElementX = async (el: Locator, x: number, { page, mouseUp = true }: DragOptions) => {
	await el.hover();
	await el.scrollIntoViewIfNeeded();
	await page.mouse.down();

	const { x: boxCenterX, y: boxCenterY } = await _getCenter(el);

	await page.mouse.move(boxCenterX, boxCenterY + ACTIVATION_CONSTRAINT);
	await page.mouse.move(boxCenterX + x, boxCenterY - ACTIVATION_CONSTRAINT);

	if (mouseUp) await page.mouse.up();
};

export const dragElementTo = async (el: Locator, x: number, y: number, { page, mouseUp = true }: DragOptions) => {
	await el.scrollIntoViewIfNeeded();
	const { x: boxCenterX, y: boxCenterY } = await _getCenter(el);

	await page.mouse.move(boxCenterX, boxCenterY);
	await page.mouse.down();

	await page.mouse.move(x, y + ACTIVATION_CONSTRAINT);
	await page.mouse.move(x, y);
	await page.waitForTimeout(100);

	if (mouseUp) await page.mouse.up();
};

export const dragElementOver = async (el: Locator, overEl: Locator, { page, mouseUp = true }: DragOptions) => {
	await el.hover();
	await el.scrollIntoViewIfNeeded();
	await page.mouse.down();

	const { x: boxCenterX, y: boxCenterY } = await _getCenter(el);
	await page.mouse.move(boxCenterX, boxCenterY + ACTIVATION_CONSTRAINT);

	const { x: overBoxCenterX, y: overBoxCenterY } = await _getCenter(overEl);
	await page.mouse.move(overBoxCenterX, overBoxCenterY - ACTIVATION_CONSTRAINT);

	if (mouseUp) await page.mouse.up();
};

export const hoverElementCenter = async (el: Locator, { page }: PlaywrightContext) => {
	const { x: boxCenterX, y: boxCenterY } = await _getCenter(el);
	await page.mouse.move(boxCenterX, boxCenterY);
};

export const clickElementCenter = async (el: Locator, { page }: PlaywrightContext) => {
	const { x: boxCenterX, y: boxCenterY } = await _getCenter(el);
	await page.mouse.click(boxCenterX, boxCenterY);
};
