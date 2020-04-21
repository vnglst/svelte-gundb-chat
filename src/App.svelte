<script>
  import { user } from "./user-store.js";
  import { nav } from "./nav-store.js";
  import Messages from "./Message.svelte";
  import Settings from "./Settings.svelte";
  import Nav from "./Nav.svelte";

  if (!$user) {
    $nav = "settings";
  }
</script>

{#if $nav === 'settings'}
  <Settings />
{:else if $nav === 'messages'}
  <Messages />
{/if}
