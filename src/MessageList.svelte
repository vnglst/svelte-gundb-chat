<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { user } from "./stores.js";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { toHSL } from "./toHSL.js";

  const dispatch = createEventDispatcher();

  export let chats;

  const [send, receive] = crossfade({
    duration: d => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: t => `
          transform: ${transform} scale(${t});
          opacity: ${t}
				`
      };
    }
  });
</script>

{#each chats as chat (chat.msgId)}
  <article
    class:user={chat.user === $user}
    in:fade
    out:send={{ key: chat.msgId }}
  >
    <div class="meta">
      <span class="time">
        {new Date(parseFloat(chat.time)).toLocaleString('en-US', {
          hour12: false
        })}
      </span>
      <span class="user">{chat.user}</span>
    </div>
    <div
      class="msg"
      style="background-color: {chat.user !== $user && toHSL(chat.user)}"
    >
      {chat.msg}
      {#if chat.user === $user}
        <button
          class="delete"
          on:click|preventDefault={() => {
            const yes = confirm('Are you sure?');
            if (yes) dispatch('delete', chat.msgId);
          }}
        >
          delete
        </button>
      {/if}
    </div>
  </article>
{/each}

<style>
  article {
    margin: 1em 0;
  }
  .meta {
    font-size: 10px;
    margin: 0.5em;
  }

  .msg {
    display: inline-block;
    position: relative;
    line-height: 1.8;
    padding: 0.4em 1em;
    background-color: #eee;
    border-radius: 1em 1em 1em 0;

    /* This makes sure returns are also rendered */
    white-space: pre-wrap;

    /* The trouble you have to go through to keep simple text inside a div! 😆 */
    /* Source: https://css-tricks.com/snippets/css/prevent-long-urls-from-breaking-out-of-container/ */

    /* These are technically the same, but use both */
    overflow-wrap: break-word;
    word-wrap: break-word;

    -ms-word-break: break-all;
    /* This is the dangerous one in WebKit, as it breaks things wherever */
    word-break: break-all;
    /* Instead use this non-standard one: */
    word-break: break-word;
  }

  .user {
    text-align: right;
  }

  .user > .msg {
    margin-left: 4em;
    background-color: #0074d9;
    color: white;
    border-radius: 1em 1em 0 1em;
  }

  .msg:hover button {
    opacity: 1;
  }

  button.delete {
    position: absolute;
    top: 0;
    left: -2em;
    width: 2em;
    height: 100%;
    background: no-repeat 50% 50% url(/trash.svg);
    background-size: 1.4em 1.4em;
    border: none;
    opacity: 0;
    transition: opacity 0.2s;
    text-indent: -9999px;
    cursor: pointer;
  }
</style>
