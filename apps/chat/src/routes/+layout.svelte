<script lang="ts">
  import type { Snippet } from 'svelte'
  let { children }: { children: Snippet } = $props()
</script>

{@render children()}

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(html) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }

  :global(body) {
    background: #fff;
    color: #202124;
    min-height: 100dvh;
  }

  /* Touch targets: all interactive elements ≥ 44×44px */
  :global(button),
  :global(a),
  :global([role='button']) {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }

  /* No hover-only affordances — always show focus styles */
  :global(:focus-visible) {
    outline: 2px solid #1a73e8;
    outline-offset: 2px;
  }
</style>
