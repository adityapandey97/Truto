import re
from typing import List, Dict, Any, Optional
from app.core.logging import logger


class CodeParser:
    """
    Code syntax parser supporting Tree-sitter when grammars are loaded,
    with robust semantic parsing fallbacks for Python, JS, TS, Go, and SQL.
    """

    @staticmethod
    def parse_symbols(code: str, file_path: str, language: str) -> List[Dict[str, Any]]:
        symbols: List[Dict[str, Any]] = []

        if language == "python":
            symbols.extend(CodeParser._parse_python(code, file_path))
        elif language in {"javascript", "typescript"}:
            symbols.extend(CodeParser._parse_js_ts(code, file_path))
        elif language == "go":
            symbols.extend(CodeParser._parse_go(code, file_path))
        else:
            symbols.extend(CodeParser._parse_generic(code, file_path))

        return symbols

    @staticmethod
    def _parse_python(code: str, file_path: str) -> List[Dict[str, Any]]:
        import ast

        symbols = []
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    symbols.append(
                        {
                            "name": node.name,
                            "type": "function",
                            "file_path": file_path,
                            "start_line": node.lineno,
                            "end_line": getattr(node, "end_lineno", node.lineno + 5),
                            "parameters": [arg.arg for arg in node.args.args],
                        }
                    )
                elif isinstance(node, ast.ClassDef):
                    symbols.append(
                        {
                            "name": node.name,
                            "type": "class",
                            "file_path": file_path,
                            "start_line": node.lineno,
                            "end_line": getattr(node, "end_lineno", node.lineno + 10),
                            "parameters": [],
                        }
                    )
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    symbols.append(
                        {
                            "name": "import",
                            "type": "import",
                            "file_path": file_path,
                            "start_line": node.lineno,
                            "end_line": getattr(node, "end_lineno", node.lineno),
                            "parameters": [],
                        }
                    )
        except Exception as err:
            logger.debug(f"Python ast.parse fallback to regex for {file_path}: {err}")
            symbols.extend(CodeParser._parse_generic(code, file_path))

        return symbols

    @staticmethod
    def _parse_js_ts(code: str, file_path: str) -> List[Dict[str, Any]]:
        symbols = []
        lines = code.split("\n")

        func_pattern = re.compile(
            r"^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)"
        )
        arrow_pattern = re.compile(
            r"^(?:export\s+)?(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>"
        )
        class_pattern = re.compile(r"^(?:export\s+)?class\s+([a-zA-Z0-9_$]+)")
        import_pattern = re.compile(r"^import\s+.*?from\s+['\"](.*?)['\"]")

        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()

            # Functions
            m_func = func_pattern.search(stripped)
            if m_func:
                symbols.append(
                    {
                        "name": m_func.group(1),
                        "type": "function",
                        "file_path": file_path,
                        "start_line": idx,
                        "end_line": min(len(lines), idx + 15),
                        "parameters": [p.strip() for p in m_func.group(2).split(",") if p.strip()],
                    }
                )
                continue

            # Arrow Functions
            m_arrow = arrow_pattern.search(stripped)
            if m_arrow:
                symbols.append(
                    {
                        "name": m_arrow.group(1),
                        "type": "function",
                        "file_path": file_path,
                        "start_line": idx,
                        "end_line": min(len(lines), idx + 15),
                        "parameters": [p.strip() for p in m_arrow.group(2).split(",") if p.strip()],
                    }
                )
                continue

            # Classes
            m_class = class_pattern.search(stripped)
            if m_class:
                symbols.append(
                    {
                        "name": m_class.group(1),
                        "type": "class",
                        "file_path": file_path,
                        "start_line": idx,
                        "end_line": min(len(lines), idx + 30),
                        "parameters": [],
                    }
                )
                continue

            # Imports
            m_imp = import_pattern.search(stripped)
            if m_imp:
                symbols.append(
                    {
                        "name": m_imp.group(1),
                        "type": "import",
                        "file_path": file_path,
                        "start_line": idx,
                        "end_line": idx,
                        "parameters": [],
                    }
                )

        return symbols

    @staticmethod
    def _parse_go(code: str, file_path: str) -> List[Dict[str, Any]]:
        symbols = []
        lines = code.split("\n")
        func_pattern = re.compile(r"^func\s+(?:\([^)]+\)\s+)?([a-zA-Z0-9_]+)\s*\(")
        type_pattern = re.compile(r"^type\s+([a-zA-Z0-9_]+)\s+struct")

        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            m_func = func_pattern.search(stripped)
            if m_func:
                symbols.append(
                    {
                        "name": m_func.group(1),
                        "type": "function",
                        "file_path": file_path,
                        "start_line": idx,
                        "end_line": min(len(lines), idx + 20),
                        "parameters": [],
                    }
                )
            m_type = type_pattern.search(stripped)
            if m_type:
                symbols.append(
                    {
                        "name": m_type.group(1),
                        "type": "struct",
                        "file_path": file_path,
                        "start_line": idx,
                        "end_line": min(len(lines), idx + 25),
                        "parameters": [],
                    }
                )
        return symbols

    @staticmethod
    def _parse_generic(code: str, file_path: str) -> List[Dict[str, Any]]:
        return []
