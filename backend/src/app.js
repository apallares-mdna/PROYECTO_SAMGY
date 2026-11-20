import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { limitadorGeneral } from './middleware/rateLimiter.js';
import { respuestaError } from './utils/respuestas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Detrás del proxy de Render/Railway: necesario para IP real (rate limit) y cookies secure
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 1. Cabeceras de seguridad estrictas con Helmet y CSP compatible con Bootstrap CDN y Google Fonts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Necesario para componentes y badges dinámicos
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:"
        ],
        connectSrc: [
          "'self'"
        ],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "same-origin" }
  })
);

// 2. CORS cerrado estrictamente al mismo origen
const origenesPermitidos = [
  `http://localhost:${env.PORT}`,
  `http://127.0.0.1:${env.PORT}`
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origenesPermitidos.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Bloqueado por política de CORS'));
    },
    credentials: true
  })
);

// 3. Verificación de Origin / Referer para mitigar CSRF en métodos mutables (POST, PUT, PATCH, DELETE)
app.use((req, res, next) => {
  const metodosMutables = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (metodosMutables.includes(req.method)) {
    const origin = req.headers['origin'];
    const referer = req.headers['referer'];
    const host = req.headers['host'];

    // Si viene origin, debe coincidir con nuestro host o lista permitida
    if (origin) {
      const match = origenesPermitidos.some(o => origin.startsWith(o)) || (host && origin.includes(host));
      if (!match) {
        return respuestaError(res, 'CSRF_DETECTADO', 'Origen no autorizado para operaciones que modifican datos.', 403);
      }
    } else if (referer && host) {
      // Si no viene origin pero sí referer, verificar host
      if (!referer.includes(host)) {
        return respuestaError(res, 'CSRF_DETECTADO', 'Referencia cruzada no autorizada.', 403);
      }
    }
  }
  next();
});

// 4. Límite de cuerpo de solicitud estricto de 100 KB
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 5. Procesamiento de cookies para JWT seguro
app.use(cookieParser());

// 6. Limitador general de tasa de peticiones para /api
app.use('/api', limitadorGeneral);

// 7. Enrutamiento de la API
app.use('/api', apiRoutes);

// 8. Servir archivos estáticos del frontend
const frontendPath = env.FRONTEND_PATH || path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// 9. Manejo de 404 para endpoints de API inexistentes
app.all('/api/*', (req, res) => {
  return respuestaError(res, 'RUTA_NO_ENCONTRADA', `El endpoint ${req.method} ${req.originalUrl} no existe.`, 404);
});

// 10. Soporte SPA (Single Page Application): redirección a index.html para rutas no-API
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 11. Manejo centralizado de errores
app.use(errorHandler);
