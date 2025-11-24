import express from 'express'

import tipoUsuarioRoutes from './routes/tipoUsuario.routes.js'
import personaRoutes from './routes/persona.routes.js'
import scoutRoutes from './routes/scout.routes.js'
import unidadRoutes from './routes/unidad.routes.js'
import dirigenteRoutes from './routes/dirigente.routes.js'
import patrullaRoutes from './routes/patrulla.routes.js'
import articuloRoutes from './routes/articulo.routes.js'
import direccionRoutes from './routes/direccion.routes.js'
import actividadRoutes from './routes/actividad.routes.js'
import asistenciaRoutes from './routes/asistencia.routes.js'
import cuotaRoutes from './routes/cuota.routes.js'

const app = express()

// IMPORTANTE: estos middlewares
app.use(express.json()); // para JSON
app.use(express.urlencoded({ extended: true })); // para x-www-form-urlencoded

app.use(tipoUsuarioRoutes);
app.use(personaRoutes);
app.use(scoutRoutes);
app.use(unidadRoutes);
app.use(dirigenteRoutes);
app.use(patrullaRoutes);
app.use(articuloRoutes);
app.use(direccionRoutes);
app.use(actividadRoutes);
app.use(asistenciaRoutes);
app.use(cuotaRoutes);


export default app 