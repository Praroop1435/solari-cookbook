import asyncio
import time
import json
import logging
from typing import Optional, Dict, Any, List, Callable

from .base import BaseTool, ToolResult
from ..config import settings

logger = logging.getLogger(__name__)

try:
    from solari_sandbox import SandboxClient
    HAS_SOLARI_SANDBOX = True
except ImportError:
    HAS_SOLARI_SANDBOX = False
    SandboxClient = None


class SandboxTool(BaseTool):
    name = "SolariSandboxTool"
    description = "Isolated microVM Python code interpreter powered by Solari for data normalization, quantitative scoring, and algorithmic ranking"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.solari_api_key
        self.base_url = settings.solari_base_url

    async def is_available(self) -> bool:
        return bool(self.api_key and HAS_SOLARI_SANDBOX)

    async def run_code(
        self,
        code: str,
        initial_context_data: Optional[Dict[str, Any]] = None,
        event_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None,
    ) -> ToolResult:
        """
        Spins up a Solari MicroVM sandbox, runs Python code in a stateful kernel,
        extracts stdout/stderr/results, and kills the VM.
        """
        start_time = time.time()
        if not await self.is_available():
            return ToolResult(
                success=False,
                error="SOLARI_API_KEY is not configured or solari-sandbox SDK is missing. Set SOLARI_API_KEY to run live sandbox analysis.",
                execution_time_ms=int((time.time() - start_time) * 1000),
            )

        sandbox_id = None
        outputs = []
        parsed_result = None

        try:
            if event_callback:
                event_callback("sandbox.booting", {"template": "base"})

            async with SandboxClient(
                api_key=self.api_key,
                base_url=self.base_url,
            ) as client:
                sandbox = await client.create(
                    template="base",
                    timeout_ms=settings.solari_sandbox_timeout_ms,
                )
                sandbox_id = sandbox.sandboxId
                logger.info(f"Created Solari sandbox {sandbox_id}")

                try:
                    await sandbox.connect()

                    if event_callback:
                        event_callback("sandbox.connected", {"sandbox_id": sandbox_id})

                    ctx = await sandbox.create_code_context("python")

                    # If initial context data is provided, load it as a Python variable
                    if initial_context_data:
                        data_json = json.dumps(initial_context_data)
                        setup_code = f"import json\ninput_data = json.loads({repr(data_json)})\n"
                        await sandbox.run_code(setup_code, context_id=ctx)

                    if event_callback:
                        event_callback("sandbox.executing", {"code_length": len(code)})

                    # Execute user / agent code in persistent kernel
                    res = await sandbox.run_code(code, context_id=ctx)

                    if res.error:
                        return ToolResult(
                            success=False,
                            error=f"Sandbox code error: {res.error}",
                            execution_time_ms=int((time.time() - start_time) * 1000),
                            metadata={"sandbox_id": sandbox_id},
                        )

                    stdout_lines = []
                    stderr_lines = []
                    raw_results = []

                    for item in getattr(res, "results", []):
                        item_type = getattr(item, "type", "result")
                        text = getattr(item, "text", "")
                        outputs.append({"type": item_type, "text": text})

                        if item_type == "stdout":
                            stdout_lines.append(text)
                        elif item_type == "stderr":
                            stderr_lines.append(text)
                        elif item_type == "result":
                            raw_results.append(text)

                    combined_stdout = "".join(stdout_lines)
                    last_result_text = raw_results[-1] if raw_results else combined_stdout

                    # Attempt to parse last result or stdout as JSON
                    try:
                        # Find json block or parse directly
                        if "OUTPUT_JSON_START" in combined_stdout:
                            json_str = combined_stdout.split("OUTPUT_JSON_START")[1].split("OUTPUT_JSON_END")[0].strip()
                            parsed_result = json.loads(json_str)
                        elif last_result_text.strip().startswith(("{", "[")):
                            parsed_result = json.loads(last_result_text.strip())
                    except Exception:
                        pass

                    execution_time = int((time.time() - start_time) * 1000)
                    return ToolResult(
                        success=True,
                        data={
                            "outputs": outputs,
                            "stdout": combined_stdout,
                            "stderr": "".join(stderr_lines),
                            "parsed_result": parsed_result,
                            "raw_result": last_result_text,
                        },
                        execution_time_ms=execution_time,
                        metadata={"sandbox_id": sandbox_id},
                    )
                finally:
                    # Always kill the VM so it doesn't linger
                    try:
                        await sandbox.kill()
                        logger.info(f"Destroyed Solari sandbox VM {sandbox_id}")
                    except Exception as kill_err:
                        logger.warning(f"Error killing sandbox {sandbox_id}: {kill_err}")

        except Exception as e:
            logger.error(f"Solari sandbox exception: {e}", exc_info=True)
            return ToolResult(
                success=False,
                error=f"Sandbox execution failed: {str(e)}",
                execution_time_ms=int((time.time() - start_time) * 1000),
                metadata={"sandbox_id": sandbox_id} if sandbox_id else {},
            )
