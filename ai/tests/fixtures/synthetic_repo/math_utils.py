def add(a: float, b: float) -> float:
    """Return sum of two numbers."""
    return a + b


def divide(a: float, b: float) -> float:
    """
    Deliberately flawed division function for Phase 4 acceptance test.
    BUG: Fails to validate denominator zero, causing uncaught ZeroDivisionError.
    """
    return a / b
