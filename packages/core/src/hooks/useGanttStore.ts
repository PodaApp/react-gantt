import { useContext } from "react";

import { useStore } from "zustand";

import { GanttContext } from "../store/GanttContext";
import { IGanttStore } from "../store/ganttStore";

type GanttStoreSelector<T> = {
	(state: IGanttStore): T;
};

export const useGanttStore = <T>(selector: GanttStoreSelector<T>): T => {
	const store = useContext(GanttContext);

	if (!store) {
		throw new Error("useStoreContext must be used within a StoreProvider");
	}

	return useStore(store, selector);
};
