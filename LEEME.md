# Yanax Client Portal

Fundación inicial del frontend de Yanax Client Portal con React, Vite, TypeScript y Tailwind CSS.

## Requisitos

- Node.js compatible con la versión de Vite instalada.
- npm.

## Preparar el entorno

```bash
npm install
npm run dev
```

Para comprobar tipos y compilar la aplicación:

```bash
npm run verificar:tipos
npm run compilar
```

## Configuración

`.env.example` reserva los nombres de las variables de Supabase para una etapa posterior. Esta Fundación no conecta con Supabase y no requiere secretos ni variables de entorno.

## Interfaz

Tailwind CSS está configurado mediante su complemento oficial para Vite. `components.json` deja preparada la configuración de shadcn/ui con alias en español y Lucide como biblioteca de iconos. Todavía no se han añadido componentes de shadcn/ui ni funcionalidades del portal.
