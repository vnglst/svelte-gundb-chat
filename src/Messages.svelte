<script>
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from "svelte";
  import { chatTopic, user } from "./stores.js";
  import { gun } from "./initGun.js";
  import ScrollToBottom from "./ScrollToBottom.svelte";
  import MessageInput from "./MessageInput.svelte";
  import MessageList from "./MessageList.svelte";
  import Spinner from "./ui/Spinner.svelte";

  const ADD_ON_SCROLL = 50; // messages to add when scrolling to the top
  let showMessages = 100; // initial messages to load

  let store = {};
  let chats = [];
  let autoscroll;
  let showScrollToBottom;
  let main;
  let isLoading = false;
  let timeout;

  $: {
    isLoading = true;
    if (timeout) clearTimeout(timeout);
    // debounce update svelte store to avoid overloading ui
    timeout = setTimeout(() => {
      // convert key/value object to sorted array of messages (with a max length)
      const arr = Object.values(store);
      const sorted = arr.sort((a, b) => a.time - b.time);
      const begin = Math.max(0, sorted.length - showMessages);
      const end = arr.length;
      chats = arr.slice(begin, end);
      isLoading = false;
    }, 200);
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

  function handleNewMessage(msg) {
    const now = new Date().getTime();
    const message = { msg, user: $user, time: now };
    gun.get($chatTopic).set(message);
  }

  function handleDelete(msgId) {
    gun
      .get($chatTopic)
      .get(msgId)
      .put(null);
  }

  onMount(async () => {
    gun
      .get($chatTopic)
      .map()
      .on((val, msgId) => {
        if (val) {
          store[msgId] = { msgId, ...val };
        } else {
          // null messages are deleted
          delete store[msgId];
          // reassign store to trigger svelte's reactivity
          store = store;
        }
      });
  });

  beforeUpdate(() => {
    autoscroll =
      main && main.offsetHeight + main.scrollTop > main.scrollHeight - 50;
  });

  afterUpdate(() => {
    if (autoscroll) main.scrollTo(0, main.scrollHeight);
  });

  onDestroy(() => {
    // remove gun listeners
    gun.get($chatTopic).off();
  });
</script>

<main bind:this={main} on:scroll={handleScroll}>
  {#if isLoading}
    <Spinner />
  {/if}
  <MessageList
    {chats}
    on:delete={e => {
      handleDelete(e.detail);
    }}
  />
</main>

<MessageInput
  on:message={e => {
    handleNewMessage(e.detail);
    scrollToBottom();
  }}
/>

{#if showScrollToBottom}
  <ScrollToBottom onScroll={scrollToBottom} />
{/if}

<style>
  main {
    margin: auto 0 3em 0;
    padding: 0.5em 1em 0.5em 1em;
    overflow-y: auto;
  }
</style>
