<script>
  import { user } from "./user-store.js";
  import { fade, fly } from "svelte/transition";
  export let reverse = false;
</script>

<style>
  div {
    margin: 0 auto;
    width: 100vw;
    display: flex;
    height: 100%;
    flex-direction: column;
    max-width: 640px;
    background-color: white;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.1);
  }
</style>

<div
  in:fly={{ x: reverse ? -200 : 200, duration: 100 }}
  out:fly={{ x: reverse ? -200 : 200, duration: 100 }}>
  <slot />
</div>
