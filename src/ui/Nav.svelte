<script>
  import { createEventDispatcher } from "svelte";
  export let showBack = false;
  export let backText = null;
  const dispatch = createEventDispatcher();
</script>

<nav>
  {#if showBack}
    <button on:click={() => dispatch('back')}>
      <svg
        height="40"
        width="40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M13.7 15.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4
          1.4L10.42 12l3.3 3.3z"
        />
      </svg>
      {#if backText}
        <span>{backText}</span>
      {/if}
    </button>
  {/if}
  <h1>
    <slot />
  </h1>
</nav>

<style>
  nav {
    position: -webkit-sticky;
    position: sticky;
    z-index: 10;
    top: 0;
    margin: 0;
    padding: 0.75em 0;
    display: flex;
    border-bottom: 1px solid #eee;
    background-color: white;
    min-height: 3em;
  }
  button {
    display: flex;
    position: absolute;
    left: 0.5em;
    top: 0.37em;
    border: none;
    background-color: white;
    align-items: center;
    padding: 0;
    color: #0074d9;
  }
  button:hover {
    transition: 0.75s cubic-bezier(0, 1.2, 0.2, 1.5);
    transform: scale(1.1);
  }

  span {
    margin: 0 0 0 -1em;
    font-size: 0.8em;
  }

  h1 {
    margin: 0 auto;
    font-size: 1.4em;
  }
</style>
