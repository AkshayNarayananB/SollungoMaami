<script lang="ts">
  import { onMount } from "svelte";
  import { OverlayScrollbars } from "overlayscrollbars";
  import "overlayscrollbars/styles/overlayscrollbars.css"; // Ensure CSS is imported
  import Icon from "@iconify/svelte";
  import I18nKeys from "../locales/keys";
  import { i18n } from "../locales/translation";

  let searchKeyword = "";
  let searchResult: any[] = [];
  let resultPannel: HTMLDivElement;
  let searchBar: HTMLDivElement;
  let pagefind: any = null; // Store the pagefind instance

  // Initialize OverlayScrollbars
  onMount(async () => {
    OverlayScrollbars(resultPannel, {
      scrollbars: {
        theme: "scrollbar-base scrollbar-auto py-1",
        autoHide: "move",
      },
    });

    // Try to load Pagefind (it will only exist after a build)
    try {
      // @ts-ignore - formatting fix for Vite/SvelteKit to load the file from public/build root
      pagefind = await import("/pagefind/pagefind.js");
      await pagefind.init();
    } catch (e) {
      console.warn("Pagefind not loaded. This is normal in Dev mode unless you've generated the index manually.");
    }
  });

  // The search function
  const search = async (keyword: string) => {
    // If pagefind isn't loaded or keyword is empty, clear results
    if (!pagefind || !keyword) {
      searchResult = [];
      updatePanelStyles(false);
      return;
    }

    // Perform Search
    const ret = await pagefind.search(keyword);
    
    // Load data for top 5-10 results (optimization)
    const dataPromises = ret.results.slice(0, 10).map((r: any) => r.data());
    searchResult = await Promise.all(dataPromises);

    updatePanelStyles(searchResult.length > 0);
  };

  // Helper to toggle panel visibility
  const updatePanelStyles = (visible: boolean) => {
    if (!resultPannel) return;
    if (visible) {
      resultPannel.style.height = `${searchResult.length * 84 + 16}px`;
      resultPannel.style.opacity = "1";
      resultPannel.style.pointerEvents = "auto"; // Ensure it's clickable
    } else {
      resultPannel.style.height = "0px";
      resultPannel.style.opacity = "0";
      resultPannel.style.pointerEvents = "none";
    }
  };

  // Reactive statement to trigger search when keyword changes
  $: search(searchKeyword);

  // Handle click outside
  const onWindowClick = (event: MouseEvent) => {
    if (
      resultPannel &&
      !resultPannel.contains(event.target as Node) &&
      !searchBar.contains(event.target as Node)
    ) {
      searchKeyword = ""; // Clear keyword to close or just hide panel
      updatePanelStyles(false);
    }
  };
</script>

<svelte:window on:click={onWindowClick} />

<!-- search bar -->
<div bind:this={searchBar} class="search-bar hidden lg:block">
  <div class="bg-black/5 dark:bg-white/5 h-10 rounded-lg flex flex-row">
    <label
      for="search-bar-input"
      class="w-10 h-10 flex flex-row justify-center items-center pl-2 pr-1 hover:cursor-text text-gray-400"
    >
      <Icon icon="mingcute:search-line" width={24} height={24} />
    </label>
    <input
      id="search-bar-input"
      class="w-36 text-[var(--text-color)] xl:focus:w-60 bg-transparent outline-none transition-all"
      placeholder={i18n(I18nKeys.nav_bar_search_placeholder)}
      type="text"
      autocomplete="off"
      on:focus={() => {
        search(searchKeyword);
      }}
      bind:value={searchKeyword}
    />
  </div>
</div>
<!-- result pannel -->
<div
  id="result-pannel"
  bind:this={resultPannel}
  class="max-h-[436px] overflow-y-scroll opacity-0 !absolute h-0 -right-3 w-[28rem] bg-[var(--card-color)] rounded-2xl top-20 transition-all"
>
  <div
    class="flex flex-col h-full onload-animation before:content-[''] before:pt-2 after:content-[''] after:pb-2"
  >
    {#each searchResult as item}
      <a
        href={item.url}
        class="mx-2 py-2 px-3 rounded-xl result-item transition-all"
      >
        <div class="flex flex-row space-x-1 items-center">
          <p
            class="line-clamp-1 text-lg font-semibold text-[var(--text-color)] result-title"
          >
            {item.meta.title}
          </p>
          <span class="text-[var(--primary-color)] font-extrabold">
            <Icon icon="cuida:caret-right-outline" width={16} height={16} />
          </span>
        </div>
        <div>
          <div class="h-10">
            <p
              class="item-excerpt text-sm line-clamp-2 text-[var(--text-color-lighten)]"
            >
              {@html item.excerpt}
            </p>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
