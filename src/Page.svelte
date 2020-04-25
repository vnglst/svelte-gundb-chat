<script>
  import { user } from "./user-store.js";
  import { fade, fly } from "svelte/transition";
  export let reverse = false;
</script>

<style>
  .animation {
    position: absolute;
    height: 100%;
    width: 100vw;
  }
  .container {
    height: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    max-width: 640px;
    background-color: white;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.1);
  }
</style>

<div
  class="animation"
  in:fly={{ x: reverse ? -200 : 200, duration: 500 }}
  out:fly={{ x: reverse ? -200 : 200, duration: 500 }}>
  <div class="container">
    <slot />
  </div>
</div>
