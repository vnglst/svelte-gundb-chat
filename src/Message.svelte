<script>
  import { beforeUpdate, afterUpdate, onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { user } from "./user-store.js";
  import { store } from "./gun-store";
  import Page from "./Page.svelte";
  import Nav from "./Nav.svelte";
  import Input from "./Input.svelte";

  let msgInput;
  let main;
  let autoscroll;

  beforeUpdate(() => {
    autoscroll =
      main && main.offsetHeight + main.scrollTop > main.scrollHeight - 50;
  });

  afterUpdate(() => {
    if (autoscroll) main.scrollTo(0, main.scrollHeight);
  });

  onMount(() => {
    if (main) main.scrollTo(0, main.scrollHeight);
  });

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

  function toHSL(str) {
    if (!str) return;
    const opts = {
      hue: [60, 360],
      sat: [75, 100],
      lum: [70, 71]
    };

    function range(hash, min, max) {
      const diff = max - min;
      const x = ((hash % diff) + diff) % diff;
      return x + min;
    }

    let hash = 0;
    if (str === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }

    let h = range(hash, opts.hue[0], opts.hue[1]);
    let s = range(hash, opts.sat[0], opts.sat[1]);
    let l = range(hash, opts.lum[0], opts.lum[1]);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }
</script>

<style>
  main {
    display: flex;
    height: 100%;
    flex-direction: column;
    background-color: white;
    flex: 1 1 auto;
    margin: 0 0 2.5em 0;
    padding: 0.5em 1em;
    overflow-y: auto;
  }

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

    /* The trouble you have to go through to keep simple text inside it's div! 😆 */
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

  .form-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  form {
    height: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    max-width: 640px;
    background-color: white;
    padding: 0.25em 1em;
  }
</style>

<Page>
  <Nav backTo="settings" backText="Sign In">Timeline</Nav>

  <main bind:this={main}>
    <div>
      {#each $store as chat (chat.msgId)}
        <article
          class:user={chat.user === $user}
          animate:flip
          in:receive={{ key: chat.msgId }}
          out:fade>
          <div class="meta">
            <span class="time">
              {new Date(chat.time).toLocaleString('en-US')}
            </span>
            <span class="user">{chat.user}</span>
          </div>
          <div
            class="msg"
            style="background-color: {chat.user !== $user && toHSL(chat.user)}">
            {chat.msg}
            {#if chat.user === $user}
              <button
                class="delete"
                on:click|preventDefault={() => {
                  const yes = confirm('Are you sure?');
                  if (yes) store.delete(chat.msgId);
                }}>
                delete
              </button>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </main>

  <div class="form-container">
    <form
      method="get"
      autocomplete="off"
      on:submit|preventDefault={e => {
        if (!msgInput || !msgInput.trim()) return;
        $store = { msg: msgInput, user: $user };
        msgInput = '';
        main.scrollTo(0, main.scrollHeight);
        e.target.msg.focus();
      }}>
      <Input
        multiline={true}
        disabled={$user ? false : true}
        maxRows={3}
        bind:value={msgInput}
        name="msg"
        placeholder="Message"
        ariaLabel="Message" />
    </form>
  </div>
</Page>
