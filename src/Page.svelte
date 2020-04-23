<script>
  import { user } from "./user-store.js";
  import { fade, fly } from "svelte/transition";
  export let reverse = false;
</script>

<style>
  div {
    position: absolute;
    width: 100vw;
    display: flex;
    height: 100%;
    flex-direction: column;
    max-width: 450px;
    background-color: white;
  }

  @media (max-width: 640px) {
    div {
      max-width: 100%;
    }
  }
</style>

<div
  in:fly={{ x: reverse ? -200 : 200, duration: 100 }}
  out:fly={{ x: reverse ? -200 : 200, duration: 100 }}>
  <slot />
</div>
