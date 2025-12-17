<script lang="ts">
  import { onMount } from "svelte";
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
  let searchBarDisplay = false;

  let resultPannel: HTMLDivElement;
  let searchBar: HTMLDivElement;
  let searchButton: HTMLButtonElement;

  // --- SEARCH LOGIC ---
  const search = async (keyword: string) => {
    if (!keyword) {
      searchResult = [];
      updatePanelHeight();
      return;
    }

    try {
      const { results } = await client.search({
        requests: [
          {
            indexName: INDEX_NAME,
            query: keyword,
            hitsPerPage: 5,
            attributesToSnippet: ["content:100", "headers:100"], 
          },
        ],
      });

      searchResult = results[0].hits;
      updatePanelHeight();
    } catch (e) {
      console.error("Algolia Search Error", e);
    }
  };

  const updatePanelHeight = () => {
    if (!resultPannel) return;
    const hasResults = searchKeyword !== "" && searchResult.length !== 0;
    
    if (hasResults) {
      // Dynamic height calculation
      resultPannel.style.height = `${searchResult.length * 84 + 16}px`;
      resultPannel.style.opacity = "1";
    } else {
      resultPannel.style.height = "0px";
      resultPannel.style.opacity = "0";
    }
  };

  // --- FORMATTERS ---
  const formatPath = (url: string) => {
    try {
      const path = new URL(url).pathname;
      return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
    } catch (e) { return url; }
  };

  const formatHeader = (item: any) => {
    const highlight = item._highlightResult?.headers;
    const raw = item.headers;

    // 1. Try Headers Array
    if (highlight && Array.isArray(highlight) && highlight.length >= 2) {
       return `${highlight[0].value} <span class="opacity-50 px-1">|</span> <span class="text-sm opacity-90">${highlight[1].value}</span>`;
    }
    if (raw && Array.isArray(raw) && raw.length >= 2) {
       return `${raw[0]} <span class="opacity-50 px-1">|</span> <span class="text-sm opacity-90">${raw[1]}</span>`;
    }

    // 2. Fallback to Hierarchy
    const h = item.hierarchy || {};
    const levels = [h.lvl0, h.lvl1, h.lvl2].filter(Boolean);
    if (levels.length > 0) return levels.slice(0, 2).join(" <span class='opacity-50 text-xs'>&gt;</span> ");
    
    // 3. Last Resort
    return item._highlightResult?.title?.value || item.title || "Untitled";
  };

  // --- EVENT HANDLERS ---
  
  // Close when clicking outside
  const onWindowClick = (event: MouseEvent) => {
    if (
      searchBarDisplay &&
      resultPannel && !resultPannel.contains(event.target as Node) &&
      searchBar && !searchBar.contains(event.target as Node) &&
      searchButton && !searchButton.contains(event.target as Node)
    ) {
      toggleSearchBar();
    }
  };

  const toggleSearchBar = () => {
    searchBarDisplay = !searchBarDisplay;
    if (searchBarDisplay) {
      searchBar.style.height = "48px";
      searchBar.style.opacity = "1";
      // Auto-focus logic can be added here if bound to an element
    } else {
      searchBar.style.height = "0px";
      searchBar.style.opacity = "0";
      searchKeyword = "";
      searchResult = [];
      updatePanelHeight();
    }
  };

  const handleLinkClick = () => {
    toggleSearchBar(); // Close everything on navigation
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResult.length > 0) {
        handleLinkClick();
        window.location.href = searchResult[0].url;
      }
    }
  };

  $: search(searchKeyword);
</script>

<svelte:window on:click={onWindowClick} />

<div class="lg:hidden">
  <button
    type="button"
    bind:this={searchButton}
    on:click={toggleSearchBar}
    class="flex w-11 justify-center rounded-lg py-2 text-[var(--text-color)] transition-all hover:bg-[var(--primary-color-hover)] hover:text-[var(--primary-color)]"
  >
    <Icon icon="mingcute:search-line" height={24} width={24} />
  </button>
</div>

<div class="fixed w-full z-20 top-[4.5rem] left-1/2 -translate-x-1/2">
  
  <div
    bind:this={searchBar}
    class="absolute left-1/2 -translate-x-1/2 w-[95%] px-1 flex flex-col h-0 opacity-0 lg:hidden bg-[var(--card-color)] rounded-xl transition-all overflow-hidden before:content-[''] after:content-[''] before:pt-1 after:pb-1 shadow-xl"
  >
    <div class="bg-black/5 dark:bg-white/5 h-10 rounded-lg flex flex-row">
      <label
        for="search-bar-input-mobile"
        class="w-10 h-10 flex flex-row justify-center items-center pl-2 pr-1 hover:cursor-text text-gray-400"
      >
        <Icon icon="mingcute:search-line" width={24} height={24} />
      </label>
      <input
        id="search-bar-input-mobile"
        class="text-[var(--text-color)] grow bg-transparent outline-none transition-all"
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
    class="max-h-[436px] overflow-y-scroll opacity-0 !absolute left-1/2 -translate-x-1/2 h-0 w-[95%] bg-[var(--card-color)] rounded-2xl top-[3.5rem] transition-all shadow-2xl"
  >
    <div class="flex flex-col h-full py-2">
      {#each searchResult as item}
        <a
          href={item.url}
          on:click={handleLinkClick}
          class="mx-2 py-2 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all block"
        >
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
</div>
