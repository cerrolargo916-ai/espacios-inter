# Guía de Despliegue en Vercel - Espacios Inter

Esta guía te explica paso a paso cómo desplegar la aplicación Espacios Inter en Vercel con una base de datos PostgreSQL.

---

## 1. Requisitos Previos

- Una cuenta en [GitHub](https://github.com)
- Una cuenta en [Vercel](https://vercel.com)
- Node.js 18+ instalado localmente
- Git instalado localmente

---

## 2. Preparar el Repositorio en GitHub

1. Inicializá un repositorio Git en tu proyecto:
   ```bash
   cd espacios-inter
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Creá un repositorio en GitHub y subí el código:
   ```bash
   git remote add origin https://github.com/tu-usuario/espacios-inter.git
   git branch -M main
   git push -u origin main
   ```

---

## 3. Crear una Base de Datos PostgreSQL

### Opción A: Vercel Postgres (Recomendado)

1. Ingresá a [Vercel Dashboard](https://vercel.com/dashboard)
2. Andá a la pestaña **Storage**
3. Hacé clic en **Create Database**
4. Seleccioná **Postgres**
5. Elegí un nombre para la base de datos (ej: `espacios-inter-db`)
6. Seleccioná la región más cercana (São Paulo para Argentina)
7. Hacé clic en **Create**
8. Vercel generará automáticamente la variable `DATABASE_URL`

### Opción B: Supabase (Alternativa gratuita)

1. Creá una cuenta en [Supabase](https://supabase.com)
2. Creá un nuevo proyecto
3. Andá a **Settings → Database**
4. Copiá la **Connection string** (URI)
5. Reemplazá `[YOUR-PASSWORD]` con tu contraseña de base de datos

---

## 4. Configurar el Proyecto para PostgreSQL

### 4.1 Actualizar el Schema de Prisma

En el archivo `prisma/schema.prisma`, cambiá el provider de SQLite a PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4.2 Crear la Migración Inicial

```bash
npx prisma migrate dev --name init
```

Esto crea la carpeta `prisma/migrations/` que Prisma usará en producción.

---

## 5. Desplegar en Vercel

### 5.1 Conectar el Repositorio

1. Ingresá a [Vercel Dashboard](https://vercel.com/dashboard)
2. Hacé clic en **Add New → Project**
3. Seleccioná tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

### 5.2 Configurar Variables de Entorno

En la pantalla de configuración, agregá las siguientes **Environment Variables**:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | URL de conexión a PostgreSQL |
| `NEXTAUTH_SECRET` | (generar con `openssl rand -base64 32`) | Secreto para NextAuth.js |
| `NEXTAUTH_URL` | `https://tu-dominio.vercel.app` | URL de tu app en producción |

Para generar el `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5.3 Configurar Build Command

En la configuración del proyecto, establecé:

- **Build Command**: `npx prisma generate && next build`
- **Output Directory**: `.next`

### 5.4 Desplegar

Hacé clic en **Deploy** y esperá a que termine el proceso.

---

## 6. Poblar la Base de Datos con Datos Iniciales

Una vez desplegado, necesitás crear el usuario administrador. Hacé una petición POST al endpoint de seed:

```bash
curl -X POST https://tu-dominio.vercel.app/api/seed
```

Esto creará:
- **Usuario admin**: silvia@espaciosinter.com.ar / Espacios2026!
- 6 pacientes de ejemplo
- 17 turnos de ejemplo
- 4 informes clínicos de ejemplo
- 8 pagos de ejemplo
- Configuración inicial de la clínica

---

## 7. Configurar Dominio Personalizado

1. En el dashboard de Vercel, andá a **Settings → Domains**
2. Agregá tu dominio personalizado (ej: `app.espaciosinter.com.ar`)
3. Vercel te mostrará los registros DNS que necesitás configurar
4. En tu proveedor de dominio, configurá los registros:
   - Tipo `CNAME`: `app` → `cname.vercel-dns.com`
   - O tipo `A`: `76.76.21.21` (para el dominio raíz)
5. Esperá a que se propaguen los DNS (puede tardar hasta 48 horas)
6. Actualizá la variable `NEXTAUTH_URL` con tu dominio personalizado

---

## 8. Configuración de Migraciones en Producción

Para que las migraciones de Prisma se ejecuten automáticamente en cada deploy, agregá un script en `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma migrate deploy && next build"
  }
}
```

Y en Vercel, cambiá el **Build Command** a:
```
npm run vercel-build
```

---

## 9. Notas de Seguridad Importantes

### Contraseñas
- **Cambiá la contraseña del admin** después del primer despliegue
- Usá contraseñas fuertes con mayúsculas, minúsculas, números y símbolos
- Nunca compartas ni publiques credenciales en el repositorio

### Variables de Entorno
- **NUNCA** subas el archivo `.env` al repositorio
- Asegurate de que `.env` esté en `.gitignore`
- Rotá el `NEXTAUTH_SECRET` periódicamente
- Usá secretos diferentes para cada entorno (desarrollo, staging, producción)

### Base de Datos
- Hacé backups regulares de la base de datos PostgreSQL
- En Vercel Postgres, los backups automáticos están disponibles en el plan Pro
- En Supabase, andá a **Database → Backups** para configurar backups

### HTTPS
- Vercel proporciona HTTPS automáticamente
- Nunca uses HTTP en producción
- Verificá que `NEXTAUTH_URL` use `https://`

### Datos de Pacientes
- Los datos clínicos son sensibles y están protegidos por ley
- Considerá encriptar datos sensibles adicionales
- Implementá políticas de retención de datos
- Asegurate de cumplir con la legislación de protección de datos personales (Ley 25.326 en Argentina)

---

## 10. Monitoreo y Mantenimiento

- **Vercel Analytics**: Activá en el dashboard para monitorear rendimiento
- **Logs**: Revisá los logs en tiempo real en Vercel Dashboard → Deployments → Logs
- **Uptime**: Vercel monitorea automáticamente el uptime
- **Actualizaciones**: Mantené las dependencias actualizadas con `npm audit`

---

## 11. Resolución de Problemas

### Error: "Prisma Client could not be generated"
- Verificá que `prisma generate` se ejecute antes de `next build`
- Asegurate de que `@prisma/client` esté en las dependencias

### Error: "NEXTAUTH_SECRET is not defined"
- Verificá que la variable esté configurada en Vercel
- Revisá que no haya espacios en blanco al inicio o final del valor

### Error de conexión a la base de datos
- Verificá que `DATABASE_URL` sea correcta
- Si usas Supabase, asegurate de que el proyecto no esté en pausa
- Verificá que la IP de Vercel tenga acceso (la mayoría de servicios lo permiten por defecto)

### La aplicación carga pero no tiene datos
- Ejecutá el endpoint de seed: `curl -X POST https://tu-dominio.vercel.app/api/seed`

---

## 12. Rollback

Si algo sale mal después de un deploy:

1. Andá a Vercel Dashboard → Deployments
2. Encontrá el último deploy que funcionaba
3. Hacé clic en los tres puntos (⋯)
4. Seleccioná **Promote to Production**

---

*Guía creada para Espacios Inter - Consultorio de Psicología*
*Lic. Silvia Hara*
