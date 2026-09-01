import logging
from typing import List, Dict, Any, Optional, Callable
from urllib.parse import urlparse

from ..models.source import Source, PageExtraction
from ..models.events import EventType
from ..tools.browser import BrowserTool

logger = logging.getLogger(__name__)


class ResearcherAgent:
    def __init__(self, browser_tool: BrowserTool):
        self.browser = browser_tool

    async def search_and_gather(
        self,
        task_id: str,
        search_queries: List[str],
        max_sources_per_query: int = 3,
        emit_event: Optional[Callable[[EventType, str, str, Dict[str, Any]], None]] = None,
    ) -> List[Source]:
        """Discovers relevant URLs and snippets for each query using Solari browser."""
        discovered_sources: List[Source] = []
        seen_urls = set()

        for query in search_queries[:4]:
            if emit_event:
                emit_event(
                    EventType.BROWSER_SEARCH,
                    f"Searching: '{query}'",
                    f"Executing web query via Solari cloud browser session",
                    {"query": query, "stage": "SEARCHING"},
                )

            res = await self.browser.search_and_browse(query, max_results=max_sources_per_query)
            if res.success and res.data:
                for item in res.data:
                    url = item.get("url", "")
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        source = Source(
                            url=url,
                            title=item.get("title", ""),
                            snippet=item.get("snippet", ""),
                            domain=item.get("domain", urlparse(url).netloc),
                            source_type="search_result",
                        )
                        discovered_sources.append(source)
                        if emit_event:
                            emit_event(
                                EventType.SOURCE_FOUND,
                                f"Discovered Source: {source.title[:45]}",
                                f"Found relevant link on {source.domain}: {source.snippet[:100]}...",
                                {"source": source.model_dump(), "stage": "SEARCHING"},
                            )
            else:
                logger.warning(f"Search query returned no results or failed: {res.error}")

        return discovered_sources

    async def browse_and_extract(
        self,
        task_id: str,
        sources: List[Source],
        record: bool = False,
        max_pages: int = 5,
        emit_event: Optional[Callable[[EventType, str, str, Dict[str, Any]], None]] = None,
    ) -> List[PageExtraction]:
        """Visits discovered URLs in Solari cloud browser sessions and extracts page contents."""
        extractions: List[PageExtraction] = []

        for source in sources[:max_pages]:
            if emit_event:
                emit_event(
                    EventType.BROWSER_NAVIGATION,
                    f"Navigating to {source.domain}",
                    f"Opening {source.url} in Solari stealth browser session",
                    {"url": source.url, "record": record, "stage": "BROWSING"},
                )

            res = await self.browser.fetch_page(source.url, record=record)
            if res.success and isinstance(res.data, PageExtraction):
                page_ext = res.data
                extractions.append(page_ext)
                if emit_event:
                    emit_event(
                        EventType.BROWSER_EXTRACTION,
                        f"Page Content Captured: {page_ext.title[:40]}",
                        f"Extracted {page_ext.byte_size} bytes and {len(page_ext.links)} interactive links from {source.domain}",
                        {"url": page_ext.url, "links_count": len(page_ext.links), "stage": "BROWSING"},
                    )
            else:
                logger.warning(f"Failed to fetch page {source.url}: {res.error}")
                if emit_event:
                    emit_event(
                        EventType.AGENT_STATUS,
                        f"Navigation Warning: {source.domain}",
                        f"Could not load page ({res.error}). Continuing with alternative sources.",
                        {"url": source.url, "error": res.error, "stage": "BROWSING"},
                    )

        return extractions
