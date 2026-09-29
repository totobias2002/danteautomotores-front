// Listas compartidas entre el formulario de publicaciones del admin y el
// cotizador de "Vender tu auto". Mantenerlas acá evita que las dos vistas
// terminen con marcas/modelos distintos.

export const MARCAS = [
  'Toyota', 'Ford', 'Chevrolet', 'Volkswagen', 'Renault', 'Peugeot', 'Fiat', 'Honda',
  'Nissan', 'Hyundai', 'Kia', 'Citroën', 'Jeep', 'Mercedes-Benz', 'BMW', 'Audi',
  'Chery', 'BAIC', 'JAC', 'DS', 'RAM', 'Suzuki', 'Mitsubishi', 'Subaru',
]

export const COLORES = [
  'Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo', 'Verde', 'Beige', 'Marrón', 'Bordó', 'Amarillo', 'Naranja',
]

export const MODELOS_SUGERIDOS = [
  'Corolla', 'Hilux', 'Etios', 'Yaris', 'SW4', 'Ranger', 'Focus', 'EcoSport', 'Ka',
  'Onix', 'Cruze', 'Tracker', 'S10', 'Gol', 'Polo', 'Amarok', 'T-Cross', 'Virtus',
  'Sandero', 'Logan', 'Duster', 'Kangoo', '208', '2008', '3008', 'Partner',
  'Cronos', 'Argo', 'Pulse', 'Toro', 'Civic', 'CR-V', 'HR-V', 'Versa', 'Kicks',
  'Frontier', 'Creta', 'Tucson', 'Sportage', 'Rio', 'C4 Cactus', 'Compass', 'Renegade',
]

export const CIUDADES = [
  'CABA', 'Zona Norte', 'Zona Oeste', 'Zona Sur', 'La Plata',
  'Córdoba', 'Rosario', 'Mendoza',
]

// Límites razonables para el campo de kilometraje (se usa tanto en el
// formulario de publicaciones del admin como en el cotizador de "Vender tu auto").
export const KM_MINIMO = 0
export const KM_MAXIMO = 500000
