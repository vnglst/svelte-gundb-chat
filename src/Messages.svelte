<script>
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { user, chatTopic } from "./stores.js";
  import { toHSL } from "./toHSL.js";
  import Page from "./Page.svelte";
  import Nav from "./Nav.svelte";
  import Input from "./Input.svelte";
  import ScrollToBottom from "./ScrollToBottom.svelte";
  import { gun } from "./initGun.js";

  const ADD_ON_SCROLL = 50; // messages to add when scrolling to the top
  let showMessages = 100; // initial messages to load

  let msgInput;
  let store = {};
  let chats = [];
  let autoscroll;
  let showScrollToBottom;
  let main;
  let isLoading = false;

  $: {
    // convert key/value object to sorted array of messages (with a max length)
    const arr = Object.values(store);
    const sorted = arr.sort((a, b) => a.time - b.time);
    const begin = Math.max(0, sorted.length - showMessages);
    const end = arr.length;
    chats = arr.slice(begin, end);
  }

  function scrollToBottom() {
    main.scrollTo({ left: 0, top: main.scrollHeight });
  }

  function handleScroll(e) {
    showScrollToBottom =
      main.scrollHeight - main.offsetHeight > main.scrollTop + 300;
    if (!isLoading && main.scrollTop <= main.scrollHeight / 10) {
      const totalMessages = Object.keys(store).length - 1;
      if (showMessages >= totalMessages) return;
      isLoading = true;
      setTimeout(() => {
        showMessages += ADD_ON_SCROLL;
        if (main.scrollTop === 0) main.scrollTop = 1;
        isLoading = false;
      }, 200);
    }
  }

  beforeUpdate(() => {
    autoscroll =
      main && main.offsetHeight + main.scrollTop > main.scrollHeight - 50;
  });

  afterUpdate(() => {
    if (autoscroll) main.scrollTo(0, main.scrollHeight);
  });

  onMount(async () => {
    let _store = {};
    let timeout;
    gun
      .get($chatTopic)
      .map()
      .on((val, msgId) => {
        if (val) {
          isLoading = true;
          _store[msgId] = { msgId, ...val };
          // debounce update svelte store to avoid overloading ui
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => {
            store = _store;
            isLoading = false;
          }, 100);
        } else {
          // null messages are deleted
          delete store[msgId];
          // reassign store to trigger svelte's reactivity
          store = store;
        }
      });
  });

  onDestroy(() => {
    // remove gun listeners
    gun.get($chatTopic).off();
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
</script>

<Page>
  <Nav backTo="settings" backText="Sign In">Messages</Nav>

  <main bind:this={main} on:scroll={handleScroll}>
    {#if isLoading}
      <div class="centered">
        <div class="loadingspinner" />
      </div>
    {/if}

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
                if (yes) gun
                    .get($chatTopic)
                    .get(chat.msgId)
                    .put(null);
              }}
            >
              delete
            </button>
          {/if}
        </div>
      </article>
    {/each}
  </main>

  <div class="form-container">
    <form
      method="get"
      autocomplete="off"
      on:submit|preventDefault={e => {
        if (!msgInput || !msgInput.trim()) return;
        const chat = { msg: msgInput, user: $user, time: new Date().getTime() };
        gun
          .get($chatTopic)
          .get(Math.random())
          .put(chat);
        msgInput = '';
        scrollToBottom();
        e.target.msg.focus();
      }}
    >
      <Input
        multiline
        disabled={!$user}
        maxRows={3}
        bind:value={msgInput}
        name="msg"
        placeholder="Message"
        ariaLabel="Message"
      />
    </form>
  </div>

  {#if showScrollToBottom}
    <ScrollToBottom onScroll={scrollToBottom} />
  {/if}
</Page>

<style>
  main {
    margin: auto 0 3em 0;
    padding: 0.5em 1em 0.5em 1em;
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

  .form-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  form {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    max-width: 640px;
    background-color: white;
    padding: 0.25em 1em;
  }
</style>
