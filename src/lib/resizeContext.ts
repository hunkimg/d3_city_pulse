import { writable, type Writable } from "svelte/store";

export interface ResizeContext {
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
}

export const createResizeContext = () => {
  const { subscribe, set, update }: Writable<ResizeContext> = writable({
    width: 600,
    height: 600,
    containerWidth: 600,
    containerHeight: 600,
  });

  return {
    subscribe,
    set,
    update,
    updateDimensions: (dimensions: Partial<ResizeContext>) => {
      update((current) => ({ ...current, ...dimensions }));
    },
  };
};

export const resizeContext = createResizeContext();
