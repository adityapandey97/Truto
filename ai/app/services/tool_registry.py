from typing import Callable, Dict, Any, List, Optional
from pydantic import BaseModel


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._definitions: Dict[str, ToolDefinition] = {}

    def register(self, name: str, description: str, parameters: Dict[str, Any]):
        def decorator(func: Callable):
            self._tools[name] = func
            self._definitions[name] = ToolDefinition(
                name=name, description=description, parameters=parameters
            )
            return func

        return decorator

    def get_definitions(self) -> List[ToolDefinition]:
        return list(self._definitions.values())

    async def execute(self, name: str, **kwargs) -> Any:
        if name not in self._tools:
            raise ValueError(f"Tool '{name}' is not registered or not authorized")
        tool_fn = self._tools[name]
        return await tool_fn(**kwargs)


tool_registry = ToolRegistry()
