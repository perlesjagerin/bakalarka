#!/bin/bash

echo "🧪 Running E2E tests for full stack..."
echo ""

# Check if backend is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "⚠️  Backend is not running on port 3000"
  echo "   Starting backend..."
  cd backend && npm run dev &
  BACKEND_PID=$!
  sleep 5
else
  echo "✅ Backend already running"
  BACKEND_PID=""
fi

# Check if frontend is running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "⚠️  Frontend is not running on port 5173"
  echo "   Starting frontend..."
  cd frontend && npm run dev &
  FRONTEND_PID=$!
  sleep 5
else
  echo "✅ Frontend already running"
  FRONTEND_PID=""
fi

echo ""
echo "🎭 Running Playwright tests..."
cd frontend && npx playwright test "$@"
TEST_EXIT_CODE=$?

# Cleanup only if we started the servers
if [ -n "$BACKEND_PID" ]; then
  echo "🛑 Stopping backend..."
  kill $BACKEND_PID 2>/dev/null
fi

if [ -n "$FRONTEND_PID" ]; then
  echo "🛑 Stopping frontend..."
  kill $FRONTEND_PID 2>/dev/null
fi

exit $TEST_EXIT_CODE
