from fastapi import Header, HTTPException, status
from app.core.config import settings


async def verify_internal_service_key(
    x_internal_service_key: str = Header(None, alias="X-Internal-Service-Key")
) -> bool:
    """
    Enforces internal service-to-service authentication between Node.js Express
    and the Python FastAPI AI microservice.
    """
    # In test mode or when no key is explicitly configured, allow test calls
    if settings.ENVIRONMENT == "test":
        return True

    if not x_internal_service_key or x_internal_service_key != settings.INTERNAL_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal service authentication key",
        )
    return True
