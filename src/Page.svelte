<script>
  import { user } from "./user-store.js";
  import { fade } from "svelte/transition";
</script>

<style>
  main {
    position: absolute;
    width: 100vw;
    display: flex;
    height: 100%;
    flex-direction: column;
    max-width: 450px;
  }

  @media (max-width: 640px) {
    main {
      max-width: 100%;
    }
  }
</style>

<main in:fade out:fade>
  <slot />
</main>
