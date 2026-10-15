import pytest
from app.services.file_filter import FileFilter
from app.services.language_detector import LanguageDetector
from app.services.code_parser import CodeParser
from app.services.symbol_extractor import SymbolExtractor
from app.services.chunking import SyntaxChunker
from app.services.dependency_graph import DependencyGraph


def test_file_filter():
    assert FileFilter.should_index_file("src/index.js", 100) is True
    assert FileFilter.should_index_file("node_modules/express/index.js", 100) is False
    assert FileFilter.should_index_file(".git/config", 100) is False
    assert FileFilter.should_index_file("bundle.min.js", 100) is False
    assert FileFilter.should_index_file("huge_file.js", 10 * 1024 * 1024) is False


def test_language_detector():
    assert LanguageDetector.detect_language("src/app.js") == "javascript"
    assert LanguageDetector.detect_language("main.py") == "python"
    assert LanguageDetector.detect_language("server.go") == "go"
    assert LanguageDetector.detect_language("schema.sql") == "sql"
    assert LanguageDetector.detect_language("unknown.xyz") == "plaintext"


def test_code_parser_and_symbol_extractor():
    py_code = """
def calculate_metrics(values):
    return sum(values)

class MetricsCollector:
    pass
"""
    symbols = SymbolExtractor.extract_symbols(py_code, "metrics.py", "python")
    assert len(symbols) == 2
    assert symbols[0].name == "calculate_metrics"
    assert symbols[0].type == "function"
    assert symbols[1].name == "MetricsCollector"
    assert symbols[1].type == "class"


def test_syntax_chunker():
    code = """import os

def process_file(path):
    # Process line 1
    # Process line 2
    return os.path.exists(path)

# Top level comment
print("Done")
"""
    symbols = SymbolExtractor.extract_symbols(code, "test.py", "python")
    chunks = SyntaxChunker.chunk_file(code, "test.py", "python", symbols)

    assert len(chunks) >= 1
    # Ensure lines are strictly preserved
    for ch in chunks:
        assert ch.start_line <= ch.end_line
        assert ch.file_path == "test.py"
        assert len(ch.content) > 0


def test_dependency_graph():
    graph = DependencyGraph()
    files = [
        {"path": "src/app.js", "content": "import express from 'express';\nimport routes from './routes';"},
        {"path": "src/routes.js", "content": "import { auth } from './auth';"},
    ]
    graph.build_from_files(files)

    deps = graph.get_dependencies("src/app.js")
    assert "express" in deps
    assert "./routes" in deps
    assert "src/app.js" in graph.get_dependents("./routes")
