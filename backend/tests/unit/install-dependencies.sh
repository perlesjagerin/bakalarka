# Instalační script pro test dependencies

echo "📦 Installing test dependencies..."

# Backend test dependencies
echo "\n🔧 Installing backend test dependencies..."
cd backend
npm install --save-dev jest@^29.7.0 @types/jest@^29.5.11 ts-jest@^29.1.1 supertest@^6.3.3 @types/supertest@^6.0.2

# Frontend test dependencies  
echo "\n🎨 Installing frontend test dependencies..."
cd ../frontend
npm install --save-dev vitest@^1.1.0 @vitest/ui@^1.1.0 jsdom@^23.0.1 @testing-library/react@^14.1.2 @testing-library/jest-dom@^6.1.5 @testing-library/user-event@^14.5.1

echo "\n✅ All test dependencies installed!"
echo "\n📚 You can now run:"
echo "  - Backend tests: npm run test --workspace=backend"
echo "  - Frontend tests: npm run test --workspace=frontend"
echo "  - See tests/unit/README.md for more info"
