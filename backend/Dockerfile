# Backend Dockerfile
FROM golang:1.21-alpine as builder

WORKDIR /app

# Copy go mod files
COPY backend/go.mod ./

# Copy source code first to get all imports
COPY backend/*.go ./

# Initialize and download dependencies
RUN go mod tidy && go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Production stage - use scratch for minimal image
FROM scratch

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

EXPOSE 3000

CMD ["./main"]
