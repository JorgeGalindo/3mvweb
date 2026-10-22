# Cuántas. Y cómo.

Película de 60 segundos, horizontal 1920 × 1080, con geometría animada,
tipografía cinética y música electrónica original. El verde pálido de la
portada se combina con menta luminosa, cian y rojo cálido sobre negro.

## Ver

Desde la raíz del repositorio: `npm run dev`, y abrir
`http://localhost:5174/animacion/`. También funciona abriendo `index.html`
directamente. Play/pausa, posición, sonido, repetición y pantalla completa.

El archivo para compartir es `exports/cuantas-y-como.mp4`.

## Montaje

| Tiempo | Historia | Movimiento |
| --- | --- | --- |
| 00–04 | Tres millones: cuántas y cómo | Contador y unidades que se reúnen |
| 04–08 | 739.000 viviendas de déficit | Volúmenes vacíos en rojo |
| 08–14 | 250.000 hogares frente a 95.000 viviendas/año | Flujos proporcionales divergentes |
| 14–23 | Acelerar a 333.000 viviendas/año | Curva que pivota y cruce que se adelanta |
| 23–26 | Siete palancas | Una cadena que se enciende |
| 26–29,5 | Silencio positivo | Reloj, documento y compuerta que se abre |
| 29,5–33 | Plazos y duplicidades | Documentos que se reorganizan |
| 33–36,5 | Iniciativa autonómica | Un recorrido que supera el bloqueo |
| 36,5–40 | Zonas estratégicas | Activación de parcelas en isometría |
| 40–43,5 | Altura y densidad | Edificios que crecen, transporte que circula |
| 43,5–47,5 | Alquiler público | Una de diez viviendas, 300.000 nuevas |
| 47,5–51,5 | Industrializar | Módulos prefabricados que se ensamblan |
| 51,5–55,5 | Actuar en paralelo | Cuatro flujos simultáneos hacia una ciudad |
| 55,5–60 | De la escasez a la abundancia | Ciudad y título final sostenido |

## Cifras y alcance

Adaptación de la sección 3 del `index.html` del repo, y de su `cap03-sim.js`.
No se han actualizado ni verificado externamente las fuentes originales.

- Déficit básico al cierre de 2025: 739.000 viviendas.
- Demanda inicial del modelo: 250.000 hogares/año. Disminuye linealmente
  hasta cero en 26 años, acumulando 3.250.000 hogares adicionales.
- Ritmo de referencia del modelo: 95.000 viviendas/año.
- Escenario acelerado: 333.000 viviendas/año; 3 millones en 9,01 años.
- Cierre de la brecha en ese escenario: 6,475 años, mostrado como 6,5.
  El horizonte para construir 3 millones y el cierre de la brecha son distintos.
- Una de cada diez de las 3 millones de viviendas: 300.000 nuevas viviendas
  públicas. Es la propuesta de la sección, no una estadística del parque actual.
- Los volúmenes urbanos son ilustrativos; las barras de la comparación anual
  son proporcionales y la selección de vivienda pública cuenta exactamente 1/10.

La leyenda del gráfico indica que es un escenario ilustrativo, no una predicción.

## Regenerar

La animación no necesita paquetes ni red. La exportación usa Python con NumPy,
FFmpeg y Playwright con Chromium. Los archivos generados se excluyen de Git.

```sh
python3 animacion/tools/soundtrack.py
ffmpeg -y -i animacion/exports/score.wav -af loudnorm=I=-16:TP=-1.5:LRA=9 -c:a aac -b:a 256k animacion/exports/banda-sonora.m4a
node animacion/tools/render.mjs --stills
node animacion/tools/render.mjs
```

Si Playwright no está instalado en el repo, `PLAYWRIGHT_MODULE` admite la ruta
absoluta a su `index.mjs`; `CHROME_PATH` permite indicar el ejecutable del navegador.
`FPS` puede ajustar la exportación (60 por defecto).

La función `window.renderFrame(segundos)` produce un fotograma determinista:
no depende del reloj del navegador. La banda sonora es síntesis original con
semilla fija, sin muestras ni material musical externo.
