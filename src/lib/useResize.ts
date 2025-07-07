import { getContext } from "svelte";
import { resizeContext, type ResizeContext } from "./resizeContext";

export function useResize() {
  return resizeContext;
}

// Alternative: if you want to use Svelte's getContext
export function useResizeContext() {
  return getContext<ResizeContext>("resize");
}
