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

  let time = new Date().getTime();
  let msgId = `${time}_${Math.random()}`;

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
    hyphens: auto;
    word-break: break-word;
  }

  .draft {
    opacity: 0.5;
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
    right: 0.2em;
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
  <Nav backTo="settings" backText="Settings">Timeline</Nav>

  <main bind:this={main}>
    <div>
      {#each $store as val (val.msgId)}
        <article
          class:draft={val.draft}
          class:user={val.user === $user}
          animate:flip
          in:receive={{ key: val.msgId }}
          out:fade>
          <div class="meta">
            <span class="time">
              {new Date(val.time).toLocaleString('en-US')}
            </span>
            <span class="user">{val.user}</span>
          </div>
          <div
            class="msg"
            style="background-color: {val.user !== $user && toHSL(val.user)}">
            {val.msg}
            <button
              class="delete"
              on:click|preventDefault={() => {
                const yes = confirm('Are you sure?');
                if (yes) store.delete(val.msgId);
              }}>
              delete
            </button>
          </div>
        </article>
      {/each}
    </div>
  </main>

  <div class="form-container">
    <form method="get" autocomplete="off" on:submit|preventDefault>
      <Input
        on:submit={e => {
          if (!msgInput) return;
          time = new Date().getTime();
          $store = { msg: msgInput, user: $user, msgId, time, draft: false };
          msgId = `${time}_${Math.random()}`;
          msgInput = '';
          main.scrollTo(0, main.scrollHeight);
        }}
        on:change={e => {
          time = new Date().getTime();
          $store = { msg: msgInput, user: $user, msgId, time, draft: true };
        }}
        disabled={$user ? false : true}
        refocus={true}
        maxLines={3}
        bind:value={msgInput}
        name="msg"
        placeholder="Message"
        ariaLabel="Message" />
    </form>
  </div>
</Page>
