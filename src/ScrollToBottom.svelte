<script>
  let y = 0;
  $: showScrollToBottom =
    document.body.scrollHeight - document.body.offsetHeight > y + 300;

  function scrollToBottom() {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
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
    padding: 0.75em;
    color: white;
    line-height: 1;
    border: none;
    border-radius: 80%;
    background-color: #333333;
    opacity: 0.9;
  }
</style>

<svelte:window bind:scrollY={y} />

{#if showScrollToBottom}
  <div>
    <button on:click|preventDefault={scrollToBottom}>↓</button>
  </div>
{/if}
