<script>
  import { fly } from "svelte/transition";
  export let el;
  export let showScrollToBottom;

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
    margin-right: 1em;
    text-align: center;
    padding: 0.75em;
    color: white;
    font-size: 18px;
    line-height: 1;
    border: none;
    border-radius: 50%;
    background-color: #555555;
    opacity: 0.9;
  }
</style>

{#if showScrollToBottom}
  <div out:fly={{ x: 20, duration: 200 }} in:fly={{ x: 20, duration: 200 }}>
    <button on:click|preventDefault={scrollToBottom}>↓</button>
  </div>
{/if}
