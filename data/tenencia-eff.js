/* Porcentaje de hogares propietarios de su vivienda principal
   por edad de la persona de referencia. Encuesta Financiera de
   las Familias (EFF), Banco de España.
   Reproducido en: Cristina Barceló y Laura Crespo,
   «La tenencia de vivienda y deuda hipotecaria de las familias
   españolas en los últimos veinte años», EsadeEcPol, abril 2025
   (cap. 1, gráfico 3 de Tres millones de viviendas).

   APROXIMACIÓN VISUAL del gráfico publicado · pendiente de
   sustituir por la serie exacta del paper de origen. */
export const tenenciaEff = [
  { year: 2002, "<35": 67, "35-44": 78, "45-54": 80, "55-64": 80, "65-74": 84, "75+": 82 },
  { year: 2005, "<35": 65, "35-44": 76, "45-54": 80, "55-64": 81, "65-74": 84, "75+": 83 },
  { year: 2008, "<35": 60, "35-44": 73, "45-54": 79, "55-64": 81, "65-74": 84, "75+": 84 },
  { year: 2011, "<35": 53, "35-44": 70, "45-54": 77, "55-64": 81, "65-74": 84, "75+": 84 },
  { year: 2014, "<35": 47, "35-44": 67, "45-54": 75, "55-64": 80, "65-74": 84, "75+": 85 },
  { year: 2017, "<35": 40, "35-44": 63, "45-54": 73, "55-64": 79, "65-74": 84, "75+": 85 },
  { year: 2020, "<35": 35, "35-44": 60, "45-54": 71, "55-64": 78, "65-74": 83, "75+": 85 },
  { year: 2022, "<35": 32, "35-44": 58, "45-54": 70, "55-64": 77, "65-74": 83, "75+": 85 },
];
export const tenenciaEffSeries = ["<35", "35-44", "45-54", "55-64", "65-74", "75+"];
