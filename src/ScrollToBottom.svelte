<script>
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from "svelte";
  export let el;
  export let showScrollToBottom = true;

  function scrollToBottom() {
    el.scrollTo({
      left: 0,
      top: el.scrollHeight,
      behavior: "smooth"
    });
  }
</script>

<style>
  div {
    position: fixed;
    bottom: 4em;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    max-width: 640px;
  }

  button {
    margin-right: 2em;
    padding: 0.75em;
    color: white;
    line-height: 1;
    border: none;
    border-radius: 80%;
    background-color: #333333;
    opacity: 0.9;
  }
</style>

{#if showScrollToBottom}
  <div>
    <button on:click|preventDefault={scrollToBottom}>↓</button>
  </div>
{/if}
