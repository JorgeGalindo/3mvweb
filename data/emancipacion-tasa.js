/* Tasa de emancipación de los 25-34 años en España.
   Calculada a partir del CSV jovenes_padres.csv del proyecto
   ecv-analysis (esfuerzo_alquiler/output/), que mide el % de
   personas de 25-34 años que viven con al menos uno de sus padres.
   tasa_emancipacion = 100 - pct_con_padres.
   Fuente: ECV (INE) · elaboración propia EsadeEcPol. */
export const emancipacionTasa = [
  { year: 2011, tasa: 59.38, con_padres: 40.62 },
  { year: 2012, tasa: 59.38, con_padres: 40.62 },
  { year: 2013, tasa: 58.99, con_padres: 41.01 },
  { year: 2014, tasa: 56.58, con_padres: 43.42 },
  { year: 2015, tasa: 56.86, con_padres: 43.14 },
  { year: 2016, tasa: 57.43, con_padres: 42.57 },
  { year: 2017, tasa: 56.15, con_padres: 43.85 },
  { year: 2018, tasa: 55.23, con_padres: 44.77 },
  { year: 2019, tasa: 52.96, con_padres: 47.04 },
  { year: 2020, tasa: 52.50, con_padres: 47.50 },
  { year: 2021, tasa: 51.75, con_padres: 48.25 },
  { year: 2022, tasa: 49.38, con_padres: 50.62 },
  { year: 2023, tasa: 49.33, con_padres: 50.67 },
  { year: 2024, tasa: 46.29, con_padres: 53.71 },
  { year: 2025, tasa: 45.57, con_padres: 54.43 },
];
