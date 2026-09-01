import asyncio
import time
import logging
from typing import Optional, List, Dict, Any, Callable
from urllib.parse import urlparse
from bs4 import BeautifulSoup

from .base import BaseTool, ToolResult
from ..models.source import PageExtraction
from ..config import settings

logger = logging.getLogger(__name__)

try:
    from solari_browser import Solari
    from solari_browser.errors import SolariError
    HAS_SOLARI_BROWSER = True
except ImportError:
    HAS_SOLARI_BROWSER = False
    Solari = None
    SolariError = Exception


class BrowserTool(BaseTool):
    name = "SolariBrowserTool"
    description = "Cloud browser automation powered by Solari for stealth navigation, web scraping, and evidence capture"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.solari_api_key
        self._solari: Optional[Any] = None
        if self.api_key and HAS_SOLARI_BROWSER:
            self._solari = Solari(api_key=self.api_key)

    async def is_available(self) -> bool:
        return bool(self.api_key and HAS_SOLARI_BROWSER)

    async def fetch_page(
        self,
        url: str,
        record: bool = False,
        timeout_ms: int = 30000,
        event_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None,
    ) -> ToolResult:
        """
        Launches a Solari cloud browser session, navigates to the URL, extracts content,
        and cleanly releases the session.
        """
        start_time = time.time()
        if not await self.is_available():
            return ToolResult(
                success=False,
                error="SOLARI_API_KEY is not configured or solari-browser SDK is missing. Set SOLARI_API_KEY to run live research.",
                execution_time_ms=int((time.time() - start_time) * 1000),
            )

        browser = None
        session_id = None
        try:
            if event_callback:
                event_callback("browser.launching", {"url": url, "record": record})

            # Launch Solari cloud browser session with stealth and optional recording
            browser = await self._solari.launch(
                stealth=settings.solari_browser_stealth,
                proxy=settings.solari_browser_proxy,
                recording=record,
            )
            session_id = browser.id
            logger.info(f"Launched Solari browser session {session_id} for URL: {url}")

            if event_callback:
                event_callback("browser.navigating", {"session_id": session_id, "url": url})

            page = await browser.new_page()
            # Set timeout
            page.set_default_navigation_timeout(timeout_ms)
            page.set_default_timeout(timeout_ms)

            response = await page.goto(url, wait_until="domcontentloaded")
            http_status = response.status if response else 200

            # Wait a moment for dynamic hydration
            await asyncio.sleep(1.5)

            title = await page.title()
            content = await page.content()

            # Parse DOM with BeautifulSoup for clean text & structured link extraction
            soup = BeautifulSoup(content, "html.parser")
            
            # Remove scripts, styles, and junk
            for tag in soup(["script", "style", "noscript", "svg", "header", "footer", "nav"]):
                tag.decompose()

            raw_text = soup.get_text(separator="\n", strip=True)
            # Cap raw text to a reasonable limit for agent processing
            if len(raw_text) > 20000:
                raw_text = raw_text[:20000] + "\n...[truncated for length]"

            # Collect relevant links
            links: List[Dict[str, str]] = []
            parsed_origin = urlparse(url).netloc
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"].strip()
                link_text = a_tag.get_text(strip=True)
                if href.startswith("http") and link_text and len(link_text) > 3:
                    links.append({"text": link_text[:80], "href": href})
                elif href.startswith("/") and len(link_text) > 3:
                    base_url = f"{urlparse(url).scheme}://{parsed_origin}"
                    links.append({"text": link_text[:80], "href": f"{base_url}{href}"})

            # Deduplicate links
            unique_links = []
            seen_hrefs = set()
            for lk in links[:30]:
                if lk["href"] not in seen_hrefs:
                    seen_hrefs.add(lk["href"])
                    unique_links.append(lk)

            extraction = PageExtraction(
                url=url,
                title=title or urlparse(url).netloc,
                markdown_content=raw_text,
                raw_text=raw_text,
                links=unique_links,
                byte_size=len(content),
                http_status=http_status,
            )

            # If recording was requested, give rrweb a brief moment to flush
            if record:
                await asyncio.sleep(1.0)

            execution_time = int((time.time() - start_time) * 1000)
            return ToolResult(
                success=True,
                data=extraction,
                execution_time_ms=execution_time,
                metadata={
                    "session_id": session_id,
                    "title": title,
                    "http_status": http_status,
                    "record": record,
                },
            )

        except Exception as e:
            logger.error(f"Solari browser error on {url}: {e}", exc_info=True)
            return ToolResult(
                success=False,
                error=f"Browser navigation failed for {url}: {str(e)}",
                execution_time_ms=int((time.time() - start_time) * 1000),
                metadata={"session_id": session_id} if session_id else {},
            )
        finally:
            if browser:
                try:
                    await browser.close()
                    logger.info(f"Released Solari browser session {session_id}")
                except Exception as close_err:
                    logger.warning(f"Error closing Solari browser: {close_err}")

    async def search_and_browse(
        self,
        query: str,
        max_results: int = 5,
        event_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None,
    ) -> ToolResult:
        """
        Executes a web search via DuckDuckGo / Bing through the Solari cloud browser,
        discovering real URLs and snippet previews.
        """
        start_time = time.time()
        if not await self.is_available():
            return ToolResult(
                success=False,
                error="SOLARI_API_KEY not configured. Please set SOLARI_API_KEY to search with cloud browser.",
                execution_time_ms=int((time.time() - start_time) * 1000),
            )

        browser = None
        session_id = None
        try:
            if event_callback:
                event_callback("browser.searching", {"query": query})

            browser = await self._solari.launch(
                stealth=settings.solari_browser_stealth,
                proxy=settings.solari_browser_proxy,
                recording=False,
            )
            session_id = browser.id
            page = await browser.new_page()

            # Search on DuckDuckGo HTML / Bing
            search_url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
            await page.goto(search_url, wait_until="domcontentloaded")
            await asyncio.sleep(1.0)

            content = await page.content()
            soup = BeautifulSoup(content, "html.parser")

            results = []
            for result_div in soup.find_all("div", class_="result")[:max_results]:
                title_elem = result_div.find("a", class_="result__a")
                snippet_elem = result_div.find("a", class_="result__snippet")
                if title_elem and title_elem.get("href"):
                    href = title_elem["href"]
                    # Clean duckduckgo redirect if present
                    if "uddg=" in href:
                        import urllib.parse
                        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                        href = parsed.get("uddg", [href])[0]

                    title = title_elem.get_text(strip=True)
                    snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""
                    domain = urlparse(href).netloc

                    if href.startswith("http") and domain:
                        results.append({
                            "title": title,
                            "url": href,
                            "snippet": snippet,
                            "domain": domain,
                        })

            return ToolResult(
                success=True,
                data=results,
                execution_time_ms=int((time.time() - start_time) * 1000),
                metadata={"session_id": session_id, "query": query, "count": len(results)},
            )
        except Exception as e:
            logger.error(f"Search failed for query '{query}': {e}", exc_info=True)
            return ToolResult(
                success=False,
                error=f"Search failed: {str(e)}",
                execution_time_ms=int((time.time() - start_time) * 1000),
            )
        finally:
            if browser:
                try:
                    await browser.close()
                except Exception:
                    pass
