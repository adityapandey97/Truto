from typing import List
from app.schemas.retrieval import SearchResultItem


class Reranker:
    @staticmethod
    def rerank_and_deduplicate(
        items: List[SearchResultItem], max_per_file: int = 3
    ) -> List[SearchResultItem]:
        """
        Deduplicates overlapping chunks from the same file and limits
        chunks per file to ensure balanced codebase diversity.
        """
        file_counts = {}
        filtered = []

        for item in items:
            count = file_counts.get(item.file_path, 0)
            if count >= max_per_file:
                continue

            # Check overlap with already accepted items
            is_overlapping = False
            for existing in filtered:
                if existing.file_path == item.file_path:
                    # Check if line intervals overlap by more than 50%
                    overlap_start = max(existing.start_line, item.start_line)
                    overlap_end = min(existing.end_line, item.end_line)
                    if overlap_start < overlap_end:
                        overlap_len = overlap_end - overlap_start
                        item_len = max(1, item.end_line - item.start_line)
                        if (overlap_len / item_len) > 0.5:
                            is_overlapping = True
                            break

            if not is_overlapping:
                filtered.append(item)
                file_counts[item.file_path] = count + 1

        return filtered
