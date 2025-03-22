

## TODO

- Add unit tests for exported hooks
- Add intergration tests for props / config

Test util to debug cursor position
```
test.beforeEach(async ({ page }) => {
	await page.evaluate(() => {
		const cursor = document.createElement("div");
		cursor.style.width = "10px";
		cursor.style.height = "10px";
		cursor.style.background = "red";
		cursor.style.position = "absolute";
		cursor.style.borderRadius = "50%";
		cursor.style.zIndex = "9999";
		document.body.appendChild(cursor);

		document.addEventListener("mousemove", (e) => {
			cursor.style.left = `${e.clientX}px`;
			cursor.style.top = `${e.clientY}px`;
		});
	});
});
```