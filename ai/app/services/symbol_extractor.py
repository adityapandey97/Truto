from typing import List
from app.schemas.repository import CodeSymbolSchema
from app.services.code_parser import CodeParser


class SymbolExtractor:
    @staticmethod
    def extract_symbols(code: str, file_path: str, language: str) -> List[CodeSymbolSchema]:
        raw_symbols = CodeParser.parse_symbols(code, file_path, language)
        return [
            CodeSymbolSchema(
                name=sym["name"],
                type=sym["type"],
                file_path=sym["file_path"],
                start_line=sym["start_line"],
                end_line=sym["end_line"],
                parameters=sym.get("parameters", []),
            )
            for sym in raw_symbols
        ]
