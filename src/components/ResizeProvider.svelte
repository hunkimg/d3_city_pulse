<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { resizeContext, type ResizeContext } from "../lib/resizeContext";

  // Props
  export let minWidth = 300;
  export let minHeight = 300;
  export let aspectRatio = 1; // 1 for square, can be customized

  // Container reference
  let container: HTMLDivElement;

  // Resize observer
  let resizeObserver: ResizeObserver;

  function updateDimensions() {
    if (container) {
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      let width: number;
      let height: number;

      // Calculate dimensions maintaining aspect ratio
      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than aspect ratio
        height = Math.max(containerHeight, minHeight);
        width = height * aspectRatio;
      } else {
        // Container is taller than aspect ratio
        width = Math.max(containerWidth, minWidth);
        height = width / aspectRatio;
      }

      // Ensure minimum dimensions
      width = Math.max(width, minWidth);
      height = Math.max(height, minHeight);

      console.log("ResizeProvider - Calculated dimensions:", { width, height });

      // Update the context
      resizeContext.updateDimensions({
        width,
        height,
        containerWidth,
        containerHeight,
      });

      console.log("ResizeProvider - Context updated");
    } else {
      console.log("ResizeProvider - No container element found");
    }
  }

  onMount(() => {
    console.log("ResizeProvider - Component mounted");

    // Initial update with default values
    resizeContext.updateDimensions({
      width: minWidth,
      height: minHeight,
      containerWidth: minWidth,
      containerHeight: minHeight,
    });

    // Wait a bit for DOM to be ready, then update with actual dimensions
    setTimeout(() => {
      updateDimensions();
    }, 100);

    resizeObserver = new ResizeObserver(() => {
      console.log("ResizeProvider - Container resized");
      updateDimensions();
    });

    if (container) {
      resizeObserver.observe(container);
      console.log("ResizeProvider - ResizeObserver attached to container");
    } else {
      console.log("ResizeProvider - Container not ready for ResizeObserver");
    }

    return () => {
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
      }
    };
  });
</script>

<div bind:this={container} class="resize-provider-container">
  <slot />
</div>

<style>
  .resize-provider-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
    min-width: 300px;
  }
</style>
