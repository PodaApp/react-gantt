import { test } from "@playwright/experimental-ct-react";

test.describe("zoom", () => {
	test.skip("allows the user to set zoom to week, month or quarter", () => {});

	test.skip("shows each the date for day when the zoom is set to week", () => {});
	test.skip("shows weekend when the zoom is set to week ", () => {});
	test.skip("shows first of the month when zoom is set to greater than a week", () => {});
	test.skip("shows only the dates for mondays when the zoom is set to greater than week", () => {});
	test.skip("the width of a month changes based on the zoom level", () => {});
	test.skip("the total rendered duration of the timeline changes based on the zoom level", () => {});
	test.skip("the date centered on the timeline does not change when the zoom level changes", () => {});
	test.skip("task sizes are adjusted to fit the zoom level", () => {});
	test.skip("the focused task duration only shows start and end dates when the zoom level is greater than week", () => {});
});

test.describe("today", () => {
	test.skip("centers the timeline on todays date when today is clicked", () => {});
});
