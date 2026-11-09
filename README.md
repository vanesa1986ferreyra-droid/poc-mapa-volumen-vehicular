# Tablero de Volumen Vehicular – CABA

Prueba de Concepto (PoC) de datos georreferenciados.
Trabajo práctico de **ISFT – Logística**.

**Integrantes:** Vanesa Ferreyra, Julian Estigarria

**Aplicación publicada:** https://poc-mapa-volumen-vehicular.vercel.app

## Descripción

Analizamos dónde se concentra el tránsito vehicular en la Ciudad de Buenos Aires. Los datos son los conteos vehiculares 2024 de Buenos Aires Data, resumidos a un punto por ubicación (94 puntos, promedio de vehículos por conteo); se excluyó un punto con coordenadas fuera de CABA. El mapa muestra cada punto de conteo con color y tamaño según su volumen, y permite ver nombre, categoría y promedio al pasar el mouse; además, una vista de mapa de calor muestra la concentración de tránsito. Se observan las avenidas con más circulación y 17 puntos de alto tránsito (≥ 20.000 vehículos). En una segunda versión agregaríamos filtros por mes o comuna y polígonos por comuna.

## Qué muestra la aplicación

- **Tres indicadores** calculados con los datos cargados en Supabase:
  - Puntos de conteo (94)
  - Vehículos promedio (12.306)
  - Puntos de alto tránsito, con 20.000 vehículos o más (17)
- **Vista de puntos** (`ScatterplotLayer`): el tamaño y el color de cada punto dependen del volumen. Azul: menos de 10.000. Naranja: de 10.000 a 19.999. Rojo: 20.000 o más.
- **Información al pasar el mouse:** ubicación, categoría (tipo de vía) y vehículos promedio.
- **Vista de mapa de calor** (`HeatmapLayer`, desafío adicional nivel 2), con un botón para alternar entre ambas vistas.

## Datos

- **Fuente:** conteo vehicular 2024, Portal de Datos Abiertos de la Ciudad de Buenos Aires (https://data.buenosaires.gob.ar/).
- **Archivo original:** `conteo_vehicular_2024.xlsx`, con 4.818 conteos semanales en 95 ubicaciones.
- **Procesamiento:**
  - Se calculó el promedio de `conteo_vehiculos` por ubicación (un punto por ubicación).
  - Las mediciones vacías no se tuvieron en cuenta en el promedio.
  - Se excluyó la ubicación "Vedia 3438", porque su longitud (-58,86) queda fuera de CABA y parece un error del dataset.
- **Dataset cargado:** `puntos_volumen_vehicular.csv` (94 filas).

Columnas de la tabla `accidentes` en Supabase (el nombre quedó de una primera versión del proyecto):

| Columna | Contenido |
|---|---|
| `nombre` | Ubicación del conteo |
| `categoria` | Tipo de vía: Calle/Avenida, Autopista o Carril exclusivo |
| `latitud`, `longitud` | Coordenadas del punto |
| `valor` | Promedio de vehículos por conteo en 2024 |
| `descripcion` | Comuna y cantidad de mediciones promediadas |

## Tecnologías

- **Supabase** (PostgreSQL) para almacenar y consultar los datos. Tiene activada la seguridad por filas (RLS) con una política de solo lectura.
- **React** y **Vite** para la aplicación web.
- **deck.gl** para las capas del mapa.
- **react-map-gl** y **MapLibre**, con el mapa base de **OpenFreeMap** (datos de OpenStreetMap).
- **Vercel** para la publicación.

## Cómo correrlo en tu computadora

1. Instalar [Node.js](https://nodejs.org/).
2. Clonar el repositorio e instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env.local` en la raíz del proyecto con las claves de tu proyecto de Supabase (la clave pública, nunca la `secret`):

   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICABLE
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abrir http://localhost:5173

El archivo `.env.local` no se sube al repositorio.

## Qué agregaríamos en una segunda versión

- **Filtros** por mes, por comuna y por tipo de vía.
- **Evolución en el tiempo:** mostrar cómo cambia el volumen a lo largo del año, y no solo el promedio.
- **Gráfico de barras** con el ranking de los puntos de mayor tránsito.
- **Polígonos por comuna** (`GeoJsonLayer`), con el volumen total o promedio de cada una.
- **Más capas:** hexágonos (`HexagonLayer`) para analizar la concentración.
- **Cruce con otros datos**, como siniestros viales, para ver si los puntos de mayor tránsito coinciden con los de más accidentes.

## Limitaciones

- Los datos corresponden solo a 2024 y a los puntos donde hay sensores, así que no cubren toda la ciudad.
- Cada punto es un promedio de conteos semanales, no una medición en tiempo real.
