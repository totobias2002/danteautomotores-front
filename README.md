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
├── hooks/       # useSondeo (consulta periódica con la pestaña visible), useExigirCuenta
├── utils/       # Reglas puras, con tests de node --test
├── services/    # Cliente de API (axios)
└── routes/      # Definición de rutas
```

Pruebas: `npm test` (tests de las reglas puras de `utils` con `node --test`) y `npm run build`.

## Cómo levantar el entorno de desarrollo

1. `npm install`
2. Copiar `.env.example` a `.env` y ajustar `VITE_API_URL` si hace falta.
3. `npm run dev`

Necesita el backend (`danteautomotores-back`) corriendo en paralelo.
