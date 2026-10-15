import os
import re
from typing import Dict, List, Set


class DependencyGraph:
    """
    Builds and queries cross-file import dependencies across indexed codebase.
    """

    def __init__(self):
        # file_path -> set of imported file paths / modules
        self.adj_list: Dict[str, Set[str]] = {}
        # imported_module -> set of dependent file paths (reverse index)
        self.reverse_deps: Dict[str, Set[str]] = {}

    def build_from_files(self, files: List[Dict[str, str]]):
        """
        Extracts imports and normalizes local relative imports to relative paths.
        """
        self.adj_list.clear()
        self.reverse_deps.clear()

        import_pattern = re.compile(r"(?:import|from)\s+['\"]([^'\"]+)['\"]")

        for f in files:
            path = f["path"]
            content = f["content"]
            imports = set(import_pattern.findall(content))
            self.adj_list[path] = imports

            for imp in imports:
                if imp not in self.reverse_deps:
                    self.reverse_deps[imp] = set()
                self.reverse_deps[imp].add(path)

    def get_dependencies(self, file_path: str) -> List[str]:
        return list(self.adj_list.get(file_path, []))

    def get_dependents(self, module_name: str) -> List[str]:
        return list(self.reverse_deps.get(module_name, []))
