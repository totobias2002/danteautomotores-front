# danteautomotores-front

Frontend del marketplace de reventa de autos usados DanteAutomotores. React + Vite + Tailwind CSS v4 + React Router.

Repo hermano: [danteautomotores-back](https://github.com/totobias2002/danteautomotores-back)

## Estructura

```
src/
├── pages/       # Home, detalle de publicación, página de agencia, login, registro,
│                # MisMensajesPage y ConversacionPage (mensajería del comprador)
├── pages/admin/ # Panel de administración (CRUD de agencias y publicaciones,
│                # admin/AdminMensajesPage, admin/AdminConversacionPage y admin/AdminUsuarioPage)
├── components/  # Componentes reutilizables (Navbar, PublicacionCard, HiloDeMensajes,
│                # BadgeNoLeidos, etc.)
├── context/     # AuthContext (usuario logueado, token JWT) y NoLeidosContext
│                # (contador de mensajes sin leer, con consulta periódica)
├── hooks/       # useSondeo (consulta periódica con la pestaña visible), useExigirCuenta,
│                # useTitulo (título de la pestaña por pantalla)
├── utils/       # Reglas puras, con tests de node --test
├── services/    # Cliente de API (axios)
└── routes/      # Definición de rutas
```

Pruebas: `npm test` (tests de las reglas puras de `utils` con `node --test`, necesita Node 21 o superior), `npm run lint` (ESLint) y `npm run build`. Los tres corren solos en GitHub Actions (`.github/workflows/ci.yml`) en cada push y pull request.

## Pantallas para celular

El sitio está pensado primero para celular (probado en 320, 360, 393, 430 y 768 px):

- El menú de tres rayitas reemplaza al menú de escritorio hasta 1024 px (`Navbar`).
- Los campos de formulario tienen 16 px en pantallas chicas: en iPhone, Safari hace zoom al enfocar un campo con letra menor (regla al final de `src/index.css`).
- Las pantallas de uso poco frecuente (cuenta, mensajes, admin) se cargan bajo demanda (`routes/AppRouter.jsx`).
- Una grilla de una sola columna lleva `grid-cols-1`: sin eso el contenido largo la estira y la página se desborda en el celular.

## Cómo levantar el entorno de desarrollo

1. `npm install`
2. Copiar `.env.example` a `.env` y ajustar `VITE_API_URL` si hace falta.
3. `npm run dev`

Necesita el backend (`danteautomotores-back`) corriendo en paralelo.

Para probar contra un backend local sin tocar el `.env`: `VITE_API_URL=http://localhost:8080/api npm run dev` (la variable del shell le gana al `.env`).
