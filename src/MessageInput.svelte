<script>
  import { createEventDispatcher } from "svelte";
  import { user, chatTopic } from "./stores.js";
  import Input from "./ui/Input.svelte";
  import { gun } from "./initGun.js";

  const dispatch = createEventDispatcher();
  let msgInput;
</script>

<div>
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
      dispatch('scrollToBottom');
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

<style>
  div {
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
