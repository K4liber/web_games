# Bluff Backend

## Setup

### Prerequisites
- [uv](https://docs.astral.sh/uv/) package manager

### Installation

```bash
# Create virtual environment and install dependencies
uv sync
```

## Running the Application

### Development Mode
```bash
# Run the Flask development server
uv run main.py
```

The server will start on `http://localhost:5000` with Socket.IO enabled.

### Production Mode
```bash
# Run with Gunicorn
uv run gunicorn --worker-class eventlet -w 1 main:app
```

## Development

### Running Tests
```bash
uv run pytest
```
