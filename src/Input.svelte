<script>
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let ariaLabelledBy = null;
  export let ariaLabel = null;
  export let placeholder = null;
  export let value = "";
  export let name = null;
  export let maxLength = 160;
  export let maxLines = 1;
  export let refocus = false;

  $: rows = Math.min(maxLines, Math.floor(value.length / 40) + 1);

  let textarea;

  const dispatch = createEventDispatcher();

  const submit = () => dispatch("submit");

  function handleKeydown(e) {
    if (e.keyCode === 13) {
      if (!value) return;
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    dispatch("submit");
    if (refocus) textarea.focus();
  }
</script>

<style>
  .input-with-button {
    position: relative;
  }

  .input {
    padding: 0.6em 2em 0.6em 0.6em;
    border-radius: 1em;
    width: 100%;
    resize: none;
  }

  .input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 116, 217, 0.5);
  }

  .submit {
    position: absolute;
    top: 0.4em;
    right: 0.4em;
    width: 1.5em;
    height: 1.5em;
    background: no-repeat 50% 50% url(/up.svg);
    background-size: 0.75em;
    border: none;
    border-radius: 50%;
    background-color: #0074d9;
    text-indent: -9999px;
    cursor: pointer;
  }
</style>

<div class="input-with-button">
  <textarea
    bind:this={textarea}
    {rows}
    class="input"
    type="text"
    {maxLength}
    {name}
    bind:value
    on:keydown={handleKeydown}
    aria-labelledby={ariaLabelledBy}
    aria-label={ariaLabel}
    {placeholder} />
  {#if value}
    <input
      class="submit"
      type="submit"
      value="Send"
      in:fade
      out:fade
      on:click={handleSubmit} />
  {/if}
</div>
