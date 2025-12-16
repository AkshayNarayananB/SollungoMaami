<script lang="ts">
  import { liteClient as algoliasearch } from "algoliasearch/lite";
  import Icon from "@iconify/svelte";
  import I18nKeys from "../locales/keys";
  import { i18n } from "../locales/translation";

  // --- CONFIGURATION ---
  const ALGOLIA_APP_ID = "161MW54G9M"; 
  const ALGOLIA_SEARCH_KEY = "8020e97a6bb3d6de5deb864154986eb7"; 
  const INDEX_NAME = "sollungomaami_com_161mw54g9m_pages";

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
      const { results } = await client.search({
        requests: [
          {
            indexName: INDEX_NAME,
            query: keyword,
            hitsPerPage: 5,
            attributesToSnippet: ["content:100", "headers:100"], // Added headers here
          },
        ],
      });

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

  // Helper 1: Clean Path (Top Line)
  const formatPath = (url: string) => {
    try {
      const path = new URL(url).pathname;
      return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
    } catch (e) {
      return url; 
    }
  };

  // Helper 2: First 2 Headers (Bottom Line)
  const formatHeader = (item: any) => {
    // A. Try to find the 'headers' array (User Request)
    // We check _highlightResult first to see if matches are bolded
    const highlight = item._highlightResult?.headers;
    const raw = item.headers;

    // Use highlighted version if available
    if (highlight && Array.isArray(highlight) && highlight.length >= 2) {
       return `${highlight[0].value} <span class="opacity-50 px-1">|</span> <span class="text-sm opacity-90">${highlight[1].value}</span>`;
    }
    
    // Fallback to raw version
    if (raw && Array.isArray(raw) && raw.length >= 2) {
       return `${raw[0]} <span class="opacity-50 px-1">|</span> <span class="text-sm opacity-90">${raw[1]}</span>`;
    }

    // B. Fallback to Hierarchy (Standard Crawler Data) if headers array is missing
    const h = item.hierarchy || {};
    const levels = [h.lvl0, h.lvl1, h.lvl2].filter(Boolean);
    
    if (levels.length > 0) {
      return levels.slice(0, 2).join(" <span class='opacity-50 text-xs'>&gt;</span> ");
    }
    
    return item._highlightResult?.title?.value || item.title || "Untitled";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResult.length > 0) {
        window.location.href = searchResult[0].url;
      }
    }
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
      on:keydown={handleKeyDown}
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
          <p class="line-clamp-1 text-xs font-mono opacity-70 text-[var(--text-color)]">
             {formatPath(item.url)}
          </p>
          <span class="text-[var(--primary-color)] ml-auto">
            <Icon icon="mingcute:arrow-right-line" width={16} height={16} />
          </span>
        </div>

        <p class="text-md font-semibold line-clamp-2 text-[var(--text-color)] mt-0.5">
           {@html formatHeader(item)}
        </p>
      </a>
    {/each}
  </div>
</div>
