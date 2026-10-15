import asyncio
import time
from typing import Dict, Any, List, Optional
from app.schemas.patches import VerifyPatchResponse
from app.core.config import settings
from app.core.logging import logger

ALLOWED_COMMAND_PREFIXES = {
    "npm test",
    "npm run test",
    "npx vitest",
    "pytest",
    "python -m pytest",
    "python -m unittest",
}


class VerificationRunner:
    """
    Executes controlled verification tests in a bounded subprocess environment
    with strict timeout, output capture, and command allowlists.
    """

    @staticmethod
    def is_command_allowed(command: str) -> bool:
        cmd_clean = command.strip().lower()
        return any(cmd_clean.startswith(prefix) for prefix in ALLOWED_COMMAND_PREFIXES)

    @staticmethod
    async def run_verification(
        patch_id: str,
        test_command: Optional[str] = None,
        cwd: Optional[str] = None,
        timeout_seconds: Optional[int] = None,
    ) -> VerifyPatchResponse:
        cmd = test_command or "npm test"
        timeout = timeout_seconds or settings.VERIFICATION_TIMEOUT_SECONDS

        if not VerificationRunner.is_command_allowed(cmd):
            return VerifyPatchResponse(
                patch_id=patch_id,
                passed=False,
                checks=[{"name": "Command Security Policy", "passed": False}],
                stdout="",
                stderr=f"Command '{cmd}' is not in the approved verification command allowlist.",
                exit_code=1,
                duration_ms=0,
            )

        start_time = time.time()
        try:
            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd,
            )

            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    process.communicate(), timeout=timeout
                )
                stdout = stdout_bytes.decode("utf-8", errors="replace")
                stderr = stderr_bytes.decode("utf-8", errors="replace")
                exit_code = process.returncode
            except asyncio.TimeoutError:
                process.kill()
                stdout = ""
                stderr = f"Verification execution timed out after {timeout} seconds."
                exit_code = 124

        except Exception as e:
            stdout = ""
            stderr = f"Failed to spawn verification process: {str(e)}"
            exit_code = 1

        duration_ms = int((time.time() - start_time) * 1000)
        passed = exit_code == 0

        checks = [
            {
                "name": "Test Suite Execution",
                "command": cmd,
                "passed": passed,
                "exit_code": exit_code,
            }
        ]

        return VerifyPatchResponse(
            patch_id=patch_id,
            passed=passed,
            checks=checks,
            stdout=stdout[:4000],  # Bound output size to avoid memory bloat
            stderr=stderr[:4000],
            exit_code=exit_code,
            duration_ms=duration_ms,
        )
