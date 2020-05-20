<script>
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let ariaLabelledBy = null;
  export let ariaLabel = null;
  export let placeholder = null;
  export let value = "";
  export let name = null;
  export let maxLength = 160;
  export let maxRows = 1;
  export let disabled = false;
  export let multiline = false;

  // TODO: kinda hacky, on desktop it's more that 40, but calculating chars per line is hard
  // FIX: something along the lines of this: https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/TextareaAutosize/TextareaAutosize.js
  const CHARS_PER_LINE = 40;

  function calcRows(v) {
    let textRows = Math.floor(v.length / CHARS_PER_LINE) + 1;
    const numberOfReturns = (v.match(/\n/g) || []).length;
    textRows += numberOfReturns;
    return Math.min(maxRows, textRows);
  }

  $: rows = calcRows(value);

  function handleKeyPress(e) {
    if (e.which === 13 && !e.shiftKey) {
      // simulate actual submit event when user pressed return
      // but not on 'soft return'
      e.target.form.dispatchEvent(
        new Event("submit", {
          cancelable: true
        })
      );
      e.preventDefault();
    }
  }
</script>

<div class="input-with-button">
  {#if multiline}
    <textarea
      {disabled}
      {rows}
      class="input"
      type="text"
      {maxLength}
      {name}
      bind:value
      on:keypress={handleKeyPress}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      {placeholder}
    />
  {:else}
    <input
      {disabled}
      {rows}
      class="input"
      type="text"
      {maxLength}
      {name}
      bind:value
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      {placeholder}
    />
  {/if}
  {#if value}
    <input class="submit" type="submit" value="Send" in:fade out:fade />
  {/if}
</div>

<style>
  .input-with-button {
    position: relative;
  }

  .input {
    padding: 0.6em 2em 0.6em 0.6em;
    border-radius: 1em;
    width: 100%;
    resize: none;
    /* fix for firefox showing two rows, see: 
        https://stackoverflow.com/questions/7695945/height-of-textarea-does-not-match-the-rows-in-firefox */
    overflow-x: hidden;
  }

  .input:disabled {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==)
      repeat;
    cursor: not-allowed;
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
