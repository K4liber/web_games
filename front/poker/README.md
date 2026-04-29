# Bluff Frontend (Angular)

## Setup

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
npm install
```

## Running the Application

### Development Mode
```bash
npm run start
```

The development server will start on `http://localhost:4200` and automatically reload on changes.

### Production Build
```bash
npm run build
```

### Running Production Build
```bash
cd dist/poker  
npx angular-http-server -p 4200
```

## Notes

- The frontend connects to the backend via WebSocket at `http://localhost:5000`
- Make sure the backend is running before starting the frontend
- Uses Angular 14 with TypeScript and ngx-socket-io for WebSocket communication

