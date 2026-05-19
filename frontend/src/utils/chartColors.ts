/**
 * Palette A - Petrole Industriel
 * Slate, Acier Bleu, Petrole Vert, Sand, Rust
 */

export const CHART_COLORS = {
  blue:     '#4A90A4',
  green:    '#2E7D6B',
  slate:    '#2C3E50',
  rust:     '#B85450',
  steel:    '#34495E',
  teal:     '#3A9E8F',
  navy:     '#1A5276',
  olive:    '#5D8A52',
  amber:    '#D4813A',
  purple:   '#7B5EA7',
};

export const COUNTRY_COLORS: Record<string, string> = {
  USA: '#2C3E50',  // Ardoise
  SAU: '#4A90A4',  // Acier bleu
  RUS: '#B85450',  // Rouille
  CAN: '#2E7D6B',  // Petrole vert
  IRQ: '#D4813A',  // Ambre
  IRN: '#1A5276',  // Navy
  ARE: '#3A9E8F',  // Teal
  BRA: '#5D8A52',  // Olive
  KWT: '#7B5EA7',  // Purple
  NOR: '#2980B9',  // Bleu nordique
  CHN: '#C0392B',  // Rouge
  MEX: '#27AE60',  // Vert mexicain
  VEN: '#8E44AD',  // Violet
  NGA: '#16A085',  // Emeraude
  LBY: '#F39C12',  // Or
  DZA: '#7F8C8D',  // Gris
  GBR: '#2471A3',  // Bleu britannique
  KAZ: '#A04000',  // Brun
  AGO: '#1E8449',  // Vert fonce
  QAT: '#D4AC0D',  // Or qatari
  OMN: '#CA6F1E',  // Ocre
};

export const SCENARIO_COLORS: Record<string, string> = {
  'IEA Stated Policies': '#2C3E50',
  'IEA Net Zero':        '#2E7D6B',
  'EIA Reference':       '#4A90A4',
  'EIA Low Growth':      '#3A9E8F',
  'OPEC Reference':      '#B85450',
};

export const PRICE_COLORS = {
  brent: '#4A90A4',
  wti:   '#2E7D6B',
  dubai: '#B85450',
};

export const METHOD_COLORS: Record<string, string> = {
  conventional: '#2C3E50',
  shale:        '#4A90A4',
  oil_sands:    '#D4813A',
  offshore:     '#2E7D6B',
  eor:          '#7B5EA7',
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#F5F0E8',
    border: '1px solid #4A90A4',
    borderRadius: '8px',
    padding: '10px 14px',
    boxShadow: '0 4px 12px rgba(44,62,80,0.2)',
  },
  labelStyle:  { color: '#2C3E50', fontWeight: 700, marginBottom: '6px', fontSize: '13px' },
  itemStyle:   { color: '#34495E', fontSize: '12px' },
};

export const GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: '#D4C7B3',
};

export const AXIS_STYLE = {
  tick:     { fill: '#2C3E50', fontSize: 11 },
  axisLine: { stroke: '#D4C7B3' },
  tickLine: { stroke: '#D4C7B3' },
};
