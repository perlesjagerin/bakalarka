#!/bin/bash

# Script pro manuální setup testovací databáze (volitelné)
echo "🔧 Setting up test database..."

# Vytvoření testovací databáze
psql -U postgres -c "CREATE DATABASE ticket_reservation_test;" 2>/dev/null || echo "⚠️  Database already exists or creation failed"

# Aplikování migrací
echo "🔄 Running migrations..."
cd "$(dirname "$0")/.." || exit
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_reservation_test" npx prisma migrate deploy

echo "✅ Test database setup complete!"
