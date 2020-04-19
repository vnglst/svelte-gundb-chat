<script>
  import { beforeUpdate, afterUpdate, onMount } from "svelte";
  import { store } from "./gun-store";
  import { user } from "./user-store.js";
  import { fade } from "svelte/transition";

  $: others = [
    ...new Set($store.map(msg => msg.user).filter(usr => usr && usr !== $user))
  ].join(", ");

  let msgInput;
  let div;
  let autoscroll;

  beforeUpdate(() => {
    autoscroll =
      div && div.offsetHeight + div.scrollTop < div.scrollHeight + 50;
  });

  afterUpdate(() => {
    if (autoscroll) div.scrollTo(0, div.scrollHeight - 50);
  });

  onMount(() => {
    if (div) div.scrollTo(0, div.scrollHeight - 50);
  });
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 450px;
  }

  @media (max-width: 640px) {
    main {
      max-width: 100%;
    }
  }

  .scrollable {
    flex: 1 1 auto;
    border-top: 1px solid #eee;
    margin: 0 0 0.5em 0;
    padding-right: 1em;
    overflow-y: auto;
  }

  article {
    margin: 1.5em 0;
  }

  .msg {
    position: relative;
    line-height: 2;
    padding: 0.5em 2.5em 0.5em 2em;
    user-select: none;
    background-color: #eee;
    border-radius: 1em 1em 1em 0;
  }

  .user {
    text-align: right;
  }

  .user > .msg {
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

  input {
    padding: 0.5em;
    border-radius: 1em;
  }

  .msg-input {
    width: 100%;
  }

  .submit-form {
    position: relative;
  }

  .submit {
    position: absolute;
    top: 0.3em;
    right: 0.3em;
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

  .meta {
    font-size: 10px;
    margin: 0.5em;
  }

  .user-input {
    position: relative;
    width: 100%;
  }
</style>

<main>
  {#if !$user}
    <h1 id="name-label">Enter your name</h1>
    <form
      class="user-input"
      on:submit|preventDefault={e => {
        const userInput = e.target.user.value;
        if (!userInput) return;
        $user = userInput;
      }}>
      <input
        placeholder="Steve Jobs"
        aria-labelledby="name-label"
        name="user"
        class="user-input" />
      <input class="submit" type="submit" value="Send" in:fade out:fade />
    </form>
  {:else}
    <h1>To: {others}</h1>
    <div class="scrollable" bind:this={div}>
      {#each $store as val (val.msgId)}
        <article class:user={val.user === $user} out:fade>
          <div class="meta">
            <span class="time">
              {new Date(val.time).toLocaleString('en-US')}
            </span>
            <span class="user">{val.user}</span>
          </div>
          <span class="msg">
            {val.msg}
            <button
              class="delete"
              on:click|preventDefault={e => {
                store.delete(val.msgId);
              }}>
              delete
            </button>
          </span>
        </article>
      {/each}
    </div>

    <form
      class="submit-form"
      method="get"
      on:submit|preventDefault={() => {
        if (!msgInput) return;
        $store = { msg: msgInput, user: $user };
        msgInput = '';
      }}>
      <input class="msg-input" type="text" name="msg" bind:value={msgInput} />
      {#if msgInput}
        <input class="submit" type="submit" value="Send" in:fade out:fade />
      {/if}
    </form>
  {/if}
</main>
