# danteautomotores-front

Frontend del marketplace de reventa de autos usados DanteAutomotores. React + Vite + Tailwind CSS v4 + React Router.

Repo hermano: [danteautomotores-back](https://github.com/totobias2002/danteautomotores-back)

## Estructura

```
src/
├── pages/       # Home, detalle de publicación, página de agencia, login, registro
├── pages/admin/ # Panel de administración (CRUD de agencias y publicaciones)
├── components/  # Componentes reutilizables (Navbar, PublicacionCard, etc.)
├── context/     # AuthContext (usuario logueado, token JWT)
├── services/    # Cliente de API (axios)
└── routes/      # Definición de rutas
```

## Cómo levantar el entorno de desarrollo

1. `npm install`
2. Copiar `.env.example` a `.env` y ajustar `VITE_API_URL` si hace falta.
3. `npm run dev`

Necesita el backend (`danteautomotores-back`) corriendo en paralelo.
