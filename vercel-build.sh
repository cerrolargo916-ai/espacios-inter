#!/bin/bash
# Build script para Vercel
# Cambia automáticamente a PostgreSQL para producción

echo "🔧 Preparando build para Vercel..."

# Cambiar provider a PostgreSQL en schema.prisma
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "✅ Schema cambiado a PostgreSQL"

# Generar cliente de Prisma
npx prisma generate

# Build de Next.js
npx next build

echo "✅ Build completado"
