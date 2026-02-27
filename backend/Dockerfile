FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY agent/ /app/agent/
COPY backend/ /app/backend/
COPY config.yaml /app/config.yaml

ENV PYTHONPATH=/app

EXPOSE ${PORT:-8000}

CMD uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000}
