import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
   import Map from 'react-map-gl/maplibre';
      import * as maplibregl from 'maplibre-gl';
   import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from './supabase';
   maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

const INITIAL_VIEW_STATE = {
  longitude: -58.4200,
  latitude: -34.6037,
  zoom: 11.5,
  pitch: 30,
  bearing: 0
};

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [vista, setVista] = useState('puntos');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from('accidentes')
        .select('*');

      if (error) {
        console.error('Error al consultar Supabase:', error);
      } else if (rows) {
        setData(rows);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const totalRegistros = data.length;
  const promedioValor = totalRegistros > 0
    ? Math.round(data.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) / totalRegistros)
    : 0;
const colisionesCriticas = data.filter(d => (Number(d.valor) || 0) >= 20000).length;

  const layers = [
    new ScatterplotLayer({
      id: 'puntos-accidentes',
      data,
      pickable: true,
      opacity: 0.85,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 6,
      radiusMaxPixels: 24,
      lineWidthMinPixels: 1.5,
      getPosition: d => [Number(d.longitud), Number(d.latitud)],
            getRadius: d => Math.sqrt(Number(d.valor) || 0) * 3,
      getFillColor: d => {
        const val = Number(d.valor) || 0;
            return val >= 20000 ? [220, 38, 38] : val >= 10000 ? [217, 119, 6] : [37, 99, 235];
      },
      getLineColor: [255, 255, 255],
      onHover: info => setTooltip(info.object ? info : null)
    })
  ];
const heatmapLayer = new HeatmapLayer({
  id: 'mapa-de-calor',
  data,
  getPosition: d => [Number(d.longitud), Number(d.latitud)],
  getWeight: d => Number(d.valor) || 0,
  radiusPixels: 60,
  intensity: 1,
  threshold: 0.05,
  aggregation: 'SUM'
});

const capas = vista === 'puntos' ? layers : [heatmapLayer];
  return (
    <div style={{ position: 'relative', width:'100%', height: '100%', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        padding: '12px 24px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
               Tablero de Volumen Vehicular - CABA
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            PoC Georreferenciada • Conteos 2024
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2563eb' }}>{totalRegistros}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Puntos de Conteo</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#d97706' }}>{promedioValor}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Vehículos Promedio</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#dc2626' }}>{colisionesCriticas}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Alto Tránsito (≥20.000)</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 40, left: 16, zIndex: 10, display: 'flex', gap: 8 }}>
  {[['puntos', 'Puntos'], ['calor', 'Mapa de calor']].map(([clave, texto]) => (
    <button
      key={clave}
      onClick={() => { setVista(clave); setTooltip(null); }}
      style={{
        padding: '8px 14px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        backgroundColor: vista === clave ? '#2563eb' : 'rgba(255,255,255,0.95)',
        color: vista === clave ? '#fff' : '#1e293b',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      {texto}
    </button>
  ))}
</div>
      {tooltip && (
        <div style={{
          position: 'absolute',
          zIndex: 20,
          pointerEvents: 'none',
          left: tooltip.x + 10,
          top: tooltip.y + 10,
          backgroundColor: '#0f172a',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}>
          <div><strong>Ubicación:</strong> {tooltip.object.nombre}</div>
          <div><strong>Categoría:</strong> {tooltip.object.categoria}</div>
          <div><strong>Vehículos (promedio):</strong> {tooltip.object.valor}</div>
        </div>
      )}

      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
           layers={capas}
      >
   <Map mapLib={maplibregl} mapStyle="https://tiles.openfreemap.org/styles/liberty" />
      </DeckGL>
    </div>
  )
}