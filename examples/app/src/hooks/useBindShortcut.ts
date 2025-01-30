import { RefObject, useLayoutEffect } from "react";

import Mousetrap, { ExtendedKeyboardEvent } from "mousetrap";

export const useBindShortcut = (
	key: string | string[] | undefined,
	handlerFunction: (e: ExtendedKeyboardEvent, combo: string) => any,
	element?: RefObject<HTMLElement>,
) => {
	useLayoutEffect(() => {
		if (!key) {
			return;
		}

		if (element && !element.current) {
			return;
		}

		const mousetrap = element?.current ? new Mousetrap(element.current) : Mousetrap;

		if (!mousetrap) {
			return;
		}

		mousetrap.bind(key, handlerFunction);
		return () => {
			if (!mousetrap) {
				return;
			}

			mousetrap.unbind(key);
		};
	}, [key, handlerFunction, element]);
};
