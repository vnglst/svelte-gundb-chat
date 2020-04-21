<script>
  import { nav } from "./nav-store.js";
  export let backTo = null;
</script>

<style>
  button {
    border: none;
    background-color: transparent;
    margin: 0;
    padding: 0;
    color: #0074d9;
  }

  button:hover {
    transition: 0.75s cubic-bezier(0, 1.2, 0.2, 1.5);
    transform: scale(1.3);
  }

  .nav {
    margin: 0;
    padding: 0.5em 0;
    display: flex;
    border-bottom: 1px solid #eee;
  }

  h1 {
    margin: 0 auto;
  }
</style>

<div class="nav">
  {#if backTo}
    <button
      on:click={() => {
        $nav = backTo;
      }}>
      <svg
        height="40"
        width="40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24">
        <title>Back</title>
        <path
          fill="currentColor"
          d="M13.7 15.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4
          1.4L10.42 12l3.3 3.3z" />
      </svg>
    </button>
  {/if}
  <h1>
    <slot />
  </h1>
</div>
