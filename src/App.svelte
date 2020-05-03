<script>
  import { nav } from "./stores.js";
  import Messages from "./Message.svelte";
  import Settings from "./Settings.svelte";
  import Nav from "./Nav.svelte";
</script>

{#if $nav === 'settings'}
  <Settings />
{:else if $nav === 'messages'}
  <Messages />
{/if}
