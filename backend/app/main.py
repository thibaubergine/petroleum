from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import production, metadata, demand, reserves, historical, prices, events, phase2, market, macro

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(production.router, prefix=settings.API_V1_PREFIX)
app.include_router(metadata.router, prefix=settings.API_V1_PREFIX)
app.include_router(demand.router, prefix=settings.API_V1_PREFIX)
app.include_router(reserves.router, prefix=settings.API_V1_PREFIX)
app.include_router(historical.router, prefix=settings.API_V1_PREFIX)
app.include_router(prices.router, prefix=settings.API_V1_PREFIX)
app.include_router(events.router, prefix=settings.API_V1_PREFIX)
app.include_router(phase2.router, prefix=settings.API_V1_PREFIX)
app.include_router(market.router, prefix=settings.API_V1_PREFIX)
app.include_router(macro.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {"message": "Oil Data Aggregation API", "status": "running", "docs": f"{settings.API_V1_PREFIX}/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
