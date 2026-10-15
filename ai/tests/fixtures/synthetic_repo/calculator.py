from math_utils import add, divide


class Calculator:
    """High-level calculation service depending on math_utils."""

    def __init__(self, name: str = "CodePilotCalc"):
        self.name = name

    def compute_average(self, values: list) -> float:
        if not values:
            return 0.0
        total = 0.0
        for val in values:
            total = add(total, val)
        return divide(total, len(values))
