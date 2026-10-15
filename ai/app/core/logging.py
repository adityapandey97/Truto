import logging
import sys
from typing import Any, Dict


class SensitiveDataFilter(logging.Filter):
    """Redacts secrets, API keys, and authorization headers from log records."""

    REDACT_KEYS = {"authorization", "api_key", "internal_service_key", "password", "token", "secret"}

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for key in self.REDACT_KEYS:
                if key in record.msg.lower():
                    record.msg = "[REDACTED_SENSITIVE_DATA]"
        return True


def get_logger(name: str = "codepilot-ai") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt='{"time":"%(asctime)s", "level":"%(levelname)s", "module":"%(name)s", "message":"%(message)s"}',
            datefmt="%Y-%m-%dT%H:%M:%SZ",
        )
        handler.setFormatter(formatter)
        handler.addFilter(SensitiveDataFilter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


logger = get_logger()
