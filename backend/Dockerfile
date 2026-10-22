# Build backend Go
FROM golang:1.24-alpine AS build

WORKDIR /src/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /out/api ./cmd/api

# Image chạy backend
FROM alpine:3.22

RUN apk --no-cache add ca-certificates \
    && adduser -D -H appuser

WORKDIR /app
COPY --from=build /out/api ./api

USER appuser

EXPOSE 8080
CMD ["./api"]