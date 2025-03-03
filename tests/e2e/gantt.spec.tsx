import { expect, test } from "@playwright/experimental-ct-react";
import { Gantt } from "@poda/core";

test("event should work", async ({ mount }) => {
	// Mount a component. Returns locator pointing to the component.
	const component = await mount(<Gantt />);

	// As with any Playwright test, assert locator text.
	await expect(component).not.toBeNull();
});
