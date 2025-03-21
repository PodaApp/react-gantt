import { Locator } from "playwright";
import { expect } from "playwright/test";

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

export const dragElementX = async (el: Locator, x: number, { page }: PlaywrightContext) => {
	expect(el).toHaveCount(1);
	await el.hover();
	await el.scrollIntoViewIfNeeded();
	await page.mouse.down();
	expect(el).toHaveCount(1);

	const { x: boxCenterX, y: boxCenterY } = await _getCenter(el);

	await page.mouse.move(boxCenterX, boxCenterY + ACTIVATION_CONSTRAINT);
	await page.mouse.move(boxCenterX + x, boxCenterY - ACTIVATION_CONSTRAINT);

	await page.mouse.up();
};

export const dragElementOver = async (el: Locator, overEl: Locator, { page }: PlaywrightContext) => {
	await el.hover();
	await el.scrollIntoViewIfNeeded();
	await page.mouse.down();

	const { x: boxCenterX, y: boxCenterY } = await _getCenter(el);
	await page.mouse.move(boxCenterX, boxCenterY + ACTIVATION_CONSTRAINT);

	const { x: overBoxCenterX, y: overBoxCenterY } = await _getCenter(overEl);
	await page.mouse.move(overBoxCenterX, overBoxCenterY - ACTIVATION_CONSTRAINT);

	await page.mouse.up();
};

export const clickElementCenter = async (el: Locator, { page }: PlaywrightContext) => {
	const { x: boxCenterX, y: boxCenterY } = await _getCenter(el);
	await page.mouse.click(boxCenterX, boxCenterY);
};
