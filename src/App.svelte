<script>
  import { nav } from "./stores.js";
  import Messages from "./Messages.svelte";
  import Settings from "./Settings.svelte";
  import Nav from "./ui/Nav.svelte";
  import Page from "./ui/Page.svelte";
  import Footer from "./Footer.svelte";
</script>

{#if $nav === 'settings'}
  <Page>
    <Nav>Sign In</Nav>
    <Settings />
    <Footer />
  </Page>
{:else if $nav === 'messages'}
  <Page>
    <Nav
      showBack
      backText="Sign In"
      on:back={() => {
        $nav = 'settings';
      }}
    >
      Messages
    </Nav>
    <Messages />
  </Page>
{/if}
