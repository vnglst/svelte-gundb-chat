<script>
  import { user } from "./user-store.js";
  import { fade, fly } from "svelte/transition";
  import { nav } from "./nav-store.js";
  import { flip } from "svelte/animate";
  import Page from "./Page.svelte";
  import Nav from "./Nav.svelte";
</script>

<style>
  input {
    padding: 0.5em;
    border-radius: 1em;
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

  .user-input {
    position: relative;
    width: 100%;
  }

  form {
    margin: auto 0;
    padding: 2em;
  }

  label {
    padding: 1em;
    font-size: 14px;
  }
</style>

<Page>
  <Nav>Settings</Nav>
  <form
    on:submit|preventDefault={e => {
      if (!$user) return;
      $nav = 'messages';
    }}>
    <label id="name-label">ENTER YOUR NICKNAME</label>
    <div class="user-input">
      <input
        placeholder="Steve Jobs"
        aria-labelledby="name-label"
        name="user"
        class="user-input"
        bind:value={$user} />
      {#if $user}
        <input class="submit" type="submit" value="Send" in:fade out:fade />
      {/if}
    </div>
  </form>
</Page>
