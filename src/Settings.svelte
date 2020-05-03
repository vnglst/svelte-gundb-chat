<script>
  import { fade, fly } from "svelte/transition";
  import { nav, user, chatTopic } from "./stores.js";
  import { flip } from "svelte/animate";
  import Page from "./Page.svelte";
  import Nav from "./Nav.svelte";
  import Input from "./Input.svelte";
</script>

<style>
  main {
    margin: auto 0;
  }

  form {
    padding: 2em;
  }

  label {
    padding: 1em;
    font-size: 14px;
  }

  footer {
    color: grey;
    margin: 4rem 0 1rem 0;
    font-size: 10px;
    text-align: center;
    line-height: 1.6;
  }

  span {
    color: red;
  }
</style>

<Page>
  <Nav>Sign In</Nav>

  <main>
    <form
      on:submit|preventDefault={e => {
        if (!$user) return;
        $nav = 'messages';
      }}>
      <label id="name-label">ENTER YOUR NICKNAME</label>
      <Input
        bind:value={$user}
        maxLength="50"
        placeholder="Steve Jobs"
        ariaLabelledBy="name-label" />
      <label id="chat-label">CHAT TOPIC</label>
      <Input
        bind:value={$chatTopic}
        maxLength="50"
        placeholder="Chat topic"
        ariaLabelledBy="chat-label" />
    </form>
  </main>

  <footer>
    Made with
    <span>♥️</span>
    by
    <a href="https://koenvangilst.nl">Koen van Gilst</a>
    <br />
    Using
    <a href="https://svelte.dev/">svelte</a>
    and
    <a href="https://gun.eco/">gunDB</a>
    see
    <a href="https://github.com/vnglst/svelte-gundb-chat">Github</a>
    <br />
    v. {process.env.APP_VERSION} git {process.env.COMMIT_HASH}
  </footer>

</Page>
