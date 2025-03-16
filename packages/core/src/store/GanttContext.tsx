import { createContext } from "react";

import { StoreApi } from "zustand";

import { IGanttStore } from "./ganttStore";

export const GanttContext = createContext<StoreApi<IGanttStore> | null>(null);
