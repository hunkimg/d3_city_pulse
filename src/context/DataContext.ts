import { getContext } from "svelte";
import { writable, type Writable } from "svelte/store";

export const CityPulseDataKey = Symbol("CityPulseData");

export interface DataContext {
  selectedDataKeys: string[];
}

export const createDataContext = () => {
  const { subscribe, set, update }: Writable<DataContext> = writable({
    selectedDataKeys: [],
  });

  return {
    subscribe,
    set,
    update,
  };
};

export const dataContext = createDataContext();

export function useDataContext() {
  return getContext<DataContext>("data");
}
