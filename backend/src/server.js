import { app } from './app.js';
import { env } from './config/env.js';
import { probarConexion } from './db/pool.js';
import { authService } from './services/authService.js';

async function iniciarServidor() {
  console.log('\n=============================================================');
  console.log('🚀 INICIANDO SAMGY BACKEND API (Node.js + Express + SQLite)');
  console.log('=============================================================');
  console.log(`- Entorno: ${env.NODE_ENV}`);
  console.log(`- Puerto: ${env.PORT}`);
  console.log(`- Base de datos SQLite: ${env.DB_PATH}`);

  try {
    // 1. Verificar e inicializar base de datos SQLite
    await probarConexion();

    // 2. Inicializar administrador si no existen usuarios activos
    await authService.inicializarAdminSiNoExiste();

    // 3. Poner a la escucha el servidor
    // En producción (Render/Railway/Docker) debe escuchar en 0.0.0.0; en local solo en loopback.
    const host = process.env.HOST || (env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
    const server = app.listen(env.PORT, host, () => {
      console.log(`\n✅ SAMGY API escuchando activamente en http://${host}:${env.PORT}`);
      console.log(`✅ Archivos estáticos de frontend servidos desde ${env.FRONTEND_PATH || '../frontend'}`);
      console.log('=============================================================\n');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ El puerto ${env.PORT} ya está en uso por otra instancia de SAMGY.`);
      } else {
        console.error('❌ Error del servidor HTTP:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error crítico durante el arranque del servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();
