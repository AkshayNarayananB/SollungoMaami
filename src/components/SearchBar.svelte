<script lang="ts">
  import { onMount } from "svelte";
  import { liteClient as algoliasearch } from "algoliasearch/lite"; // <--- CHANGED IMPORT
  import Icon from "@iconify/svelte";
  import I18nKeys from "../locales/keys";
  import { i18n } from "../locales/translation";

  // --- CONFIGURATION ---
  const ALGOLIA_APP_ID = "161MW54G9M"; 
  const ALGOLIA_SEARCH_KEY = "8020e97a6bb3d6de5deb864154986eb7"; 
  const INDEX_NAME = "blog_posts"; // Must match your Python script

  // <--- CHANGED INITIALIZATION (v5)
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

  let searchKeyword = "";
  let searchResult: any[] = [];
  let resultPannel: HTMLDivElement;
  let searchBar: HTMLDivElement;

  const search = async (keyword: string) => {
    if (!keyword) {
      searchResult = [];
      togglePanel(false);
      return;
    }

    try {
      // <--- CHANGED SEARCH SYNTAX (v5)
      const { results } = await client.search({
        requests: [
          {
            indexName: INDEX_NAME,
            query: keyword,
            hitsPerPage: 5,
            attributesToSnippet: ["content:100", "description:100"],
          },
        ],
      });

      // v5 returns an array of results. We take the first one (for our index).
      searchResult = results[0].hits;
      
      togglePanel(searchResult.length > 0);
    } catch (e) {
      console.error("Algolia Search Error", e);
    }
  };

  const togglePanel = (show: boolean) => {
    if (!resultPannel) return;
    resultPannel.style.height = show ? `${searchResult.length * 84 + 16}px` : "0px";
    resultPannel.style.opacity = show ? "1" : "0";
    resultPannel.style.pointerEvents = show ? "auto" : "none";
  };

  $: search(searchKeyword);

  const onWindowClick = (event: MouseEvent) => {
    if (resultPannel && !resultPannel.contains(event.target as Node) && !searchBar.contains(event.target as Node)) {
      searchKeyword = "";
      togglePanel(false);
    }
  };
</script>

<svelte:window on:click={onWindowClick} />

<div bind:this={searchBar} class="search-bar hidden lg:block">
  <div class="bg-black/5 dark:bg-white/5 h-10 rounded-lg flex flex-row">
    <label for="search-bar-input" class="w-10 h-10 flex flex-row justify-center items-center pl-2 pr-1 hover:cursor-text text-gray-400">
      <Icon icon="mingcute:search-line" width={24} height={24} />
    </label>
    <input
      id="search-bar-input"
      class="w-36 text-[var(--text-color)] xl:focus:w-60 bg-transparent outline-none transition-all"
      placeholder={i18n(I18nKeys.nav_bar_search_placeholder)}
      type="text"
      autocomplete="off"
      bind:value={searchKeyword}
    />
  </div>
</div>

<div
  id="result-pannel"
  bind:this={resultPannel}
  class="max-h-[436px] overflow-y-scroll opacity-0 absolute h-0 -right-3 w-[28rem] bg-[var(--card-color)] rounded-2xl top-20 transition-all z-50 shadow-xl"
>
  <div class="flex flex-col h-full py-2">
    {#each searchResult as item}
      <a href={item.url} class="mx-2 py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all block">
        <div class="flex flex-row space-x-1 items-center">
          <p class="line-clamp-1 text-lg font-semibold text-[var(--text-color)]">
             {@html item._highlightResult?.title?.value || item.title}
          </p>
          <span class="text-[var(--primary-color)]">
            <Icon icon="mingcute:arrow-right-line" width={16} height={16} />
          </span>
        </div>
        <p class="text-sm line-clamp-2 text-[var(--text-color-lighten)] mt-1">
           {@html item._snippetResult?.content?.value || item.description}
        </p>
      </a>
    {/each}
  </div>
</div>
