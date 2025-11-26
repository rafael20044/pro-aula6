# 📚 Proyecto Aula

**Questopia** es una aplicación móvil de preguntas y respuestas diseñada para facilitar el aprendizaje colaborativo entre estudiantes. Construida con **Ionic + Angular** y **Supabase**, ofrece una experiencia moderna, responsive y con soporte para Android.

---

## ✨ Características Principales

### 🔐 Autenticación
- Sistema de registro e inicio de sesión con Supabase Auth
- Perfiles de usuario personalizables con foto, ubicación y fecha de nacimiento
- Roles de usuario (Usuario normal / Administrador)
- Cierre de sesión con limpieza de caché

### 📝 Sistema de Preguntas
- **Crear preguntas** con título, descripción y hasta 5 imágenes
- **Etiquetas (tags)** para categorizar preguntas
- **Feed aleatorio** de preguntas en cada carga
- **Buscador en tiempo real** con debounce para optimización
- **Sistema de reacciones** (like/dislike) para preguntas y respuestas
- **Contador de respuestas** visible en cada pregunta

### 💬 Respuestas
- Responder preguntas con texto extenso (hasta 2000 caracteres)
- Textarea con auto-resize inteligente
- Contador de caracteres en tiempo real con advertencia
- Sistema de reacciones para respuestas
- Eliminación de respuestas duplicadas

### 🛡️ Moderación y Reportes
- **Menú contextual** de tres puntos en cada pregunta
- **Reportar preguntas/usuarios** con sistema de múltiples pasos:
  - Selección obligatoria de razón (6 opciones)
  - Descripción detallada (mínimo 70 caracteres)
  - Validaciones en tiempo real
- **Eliminar preguntas propias** con confirmación
- Editar preguntas (en desarrollo)

### 🔔 Notificaciones
- Sistema de notificaciones en tiempo real
- Notificaciones por reacciones a preguntas/respuestas
- Diseño moderno con animaciones
- Estado de leído/no leído

### 👤 Perfiles
- Visualización de perfil con estadísticas
- Lista de preguntas del usuario
- Edición de perfil con recarga automática
- Carga de foto de perfil desde cámara o galería
- Resolución automática de URLs de Supabase Storage

### 🎨 Diseño y UX
- **Modo claro/oscuro** con toggle persistente
- Diseño **Material Design 3** y minimalista iOS
- Animaciones suaves (fadeIn, bounce, pulse)
- Responsive para todos los tamaños de pantalla
- Componentes reutilizables y modulares

### 🔧 Panel de Administración
- Gestión de usuarios
- Gestión de preguntas
- Gestión de tags
- Reportes y moderación (en desarrollo)

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 20** - Framework principal
- **Ionic 8** - Framework de UI móvil
- **TypeScript** - Lenguaje de programación
- **SCSS** - Preprocesador CSS con variables CSS nativas
- **RxJS 7.8** - Programación reactiva

### Backend & Services
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Storage para imágenes
  - Auth para autenticación
  - Real-time subscriptions
- **Capacitor 7** - Bridge nativo para Android/iOS

### Plugins de Capacitor
- `@capacitor/camera` - Acceso a cámara y galería
- `@capacitor/status-bar` - Gestión de barra de estado
- `@capacitor/haptics` - Feedback táctil
- `@capacitor/keyboard` - Manejo de teclado
- `@capacitor/toast` - Notificaciones toast nativas
- `@capacitor/local-notifications` - Notificaciones locales
- `@capawesome/capacitor-file-picker` - Selector de archivos

---

## 📋 Requisitos Previos

- **Node.js** 18+ y npm
- **Angular CLI** 20+
- **Ionic CLI** 8+
- **Android Studio** (para desarrollo Android)
- Cuenta de **Supabase** con proyecto configurado

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/rafael20044/pro-aula6.git
cd pro-aula6
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Edita `src/environments/environment.ts` con tus credenciales de Supabase:

```typescript
export const environment = {
  production: false,
  SUPABASE_URL: 'TU_SUPABASE_URL',
  SUPABASE_KEY: 'TU_SUPABASE_ANON_KEY',
};
```

### 4. Ejecutar en desarrollo web
```bash
npm start
# o
ionic serve
```

La aplicación estará disponible en `http://localhost:4200`

### 5. Ejecutar en Android

```bash
# Compilar para web
npm run build

# Sincronizar con Capacitor
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

---

## 📁 Estructura del Proyecto

```
pro-aula6/
├── src/
│   ├── app/
│   │   ├── core/                    # Módulo core (guards, auth, servicios base)
│   │   │   ├── auth/                # Estado de autenticación
│   │   │   ├── guards/              # Guards de rutas (auth, role, logged, welcome)
│   │   │   ├── services/            # Servicios core (theme, statusbar, toast)
│   │   │   └── supabase/            # Cliente de Supabase
│   │   ├── interfaces/              # Interfaces TypeScript
│   │   ├── pages/                   # Páginas de la app
│   │   │   ├── admin/               # Módulo de administración
│   │   │   └── user/                # Módulo de usuario
│   │   │       ├── auth/            # Login/registro
│   │   │       ├── home/            # Feed principal
│   │   │       ├── question-details/# Detalles de pregunta
│   │   │       ├── create-question/ # Crear pregunta
│   │   │       └── edit-profile/    # Editar perfil
│   │   ├── shared/                  # Componentes y servicios compartidos
│   │   │   ├── components/          # Componentes reutilizables
│   │   │   │   ├── home/            # Componente de feed
│   │   │   │   ├── profile/         # Componente de perfil
│   │   │   │   ├── notification/    # Componente de notificaciones
│   │   │   │   ├── question-card/   # Card de pregunta
│   │   │   │   ├── question-form/   # Formulario de pregunta
│   │   │   │   └── ...
│   │   │   └── services/            # Servicios (user, question, photo, reaction, etc.)
│   │   ├── const/                   # Constantes (localStorage keys)
│   │   ├── app-routing.module.ts    # Rutas principales
│   │   └── app.module.ts            # Módulo raíz
│   ├── assets/                      # Recursos estáticos
│   ├── environments/                # Variables de entorno
│   ├── theme/                       # Variables SCSS globales
│   └── global.scss                  # Estilos globales
├── android/                         # Proyecto Android (Capacitor)
├── capacitor.config.ts              # Configuración de Capacitor
├── angular.json                     # Configuración de Angular
├── ionic.config.json                # Configuración de Ionic
└── package.json                     # Dependencias del proyecto
```

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

#### `users`
- `id` (uuid, PK)
- `uid` (text, Auth UUID)
- `full_name` (text)
- `username` (text, unique)
- `photo` (text, URL de Storage)
- `is_admin` (boolean)
- `created_at` (timestamp)

#### `questions`
- `question_id` (int, PK, autoincrement)
- `user_id` (int, FK → users.id)
- `title` (text)
- `body` (text)
- `tags` (text[])
- `created_at` (timestamp)

#### `question_images`
- `image_id` (int, PK)
- `question_id` (int, FK)
- `image_url` (text, Storage path)

#### `answers`
- `answer_id` (int, PK)
- `question_id` (int, FK)
- `user_id` (int, FK)
- `body` (text)
- `created_at` (timestamp)

#### `reactions`
- `reaction_id` (int, PK)
- `user_id` (int, FK)
- `target_id` (int) - ID de pregunta o respuesta
- `target_type` (text) - 'question_id' o 'answer_id'
- `type` (text) - 'LIKE' o 'DISLIKE'

#### `notifications`
- `notification_id` (int, PK)
- `user_id` (int, FK)
- `type` (text)
- `question_id` (int, nullable)
- `answer_id` (int, nullable)
- `from_user_id` (int, FK)
- `is_read` (boolean)
- `created_at` (timestamp)

### Storage Buckets
- `avatars` - Fotos de perfil
- `question_images` - Imágenes de preguntas

---

## 🎯 Funciones RPC (Supabase)

La aplicación utiliza funciones RPC para optimizar consultas:

- `get_questions_with_details()` - Feed de preguntas con contadores
- `get_question_detail(question_id)` - Detalles completos de pregunta
- `get_user_questions(user_id)` - Preguntas de un usuario
- `search_questions(query)` - Búsqueda de preguntas

---

## 🧪 Scripts Disponibles

```bash
npm start          # Desarrollo web (localhost:4200)
npm run build      # Compilar para producción
npm test           # Ejecutar tests
npm run lint       # Linter de código
```

---

## 🔒 Guards y Protección de Rutas

- **AuthGuard** - Protege rutas que requieren autenticación
- **LoggedGuard** - Redirige usuarios autenticados (login/registro)
- **RoleGuard** - Protege rutas de administrador
- **WelcomeGuard** - Controla pantalla de bienvenida

---

## 🎨 Theming

La aplicación soporta modo claro y oscuro con variables CSS:

```scss
// Usar variables de tema
color: var(--ion-text-color);
background: var(--ion-background-color);
```

El toggle de tema persiste en `localStorage` y se aplica globalmente.

---

## 📱 Características Móviles

- **Status Bar** personalizada según tema
- **Haptic Feedback** en interacciones importantes
- **Toast nativo** para notificaciones
- **Cámara y galería** integradas
- **Teclado** con gestión automática

---

## 🐛 Solución de Problemas

### Error: "Cannot find module @capacitor/..."
```bash
npm install
npx cap sync
```

### Imágenes no cargan desde Supabase
Verifica que los buckets de Storage sean públicos y que las políticas RLS estén configuradas.

### Error de compilación de Android
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

---

## 🚧 Funcionalidades en Desarrollo

- [ ] Backend de reportes (actualmente solo UI)
- [ ] Editar preguntas
- [ ] Cambio de contraseña
- [ ] Cambio de email con verificación
- [ ] Panel de administración completo
- [ ] Notificaciones push
- [ ] Compartir preguntas

---

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 👤 Autores

**Rafael Barragan - Backend**
- GitHub: [@rafael20044](https://github.com/rafael20044)
**Melany Olivera - Frontend**
- GitHub: [@melanyolivera211](https://github.com/melanyolivera211)
**Samuel Ospina - Frontend**
- GitHub: [@SamuelOsp](https://github.com/rafael20044)
**Maria Perez - Diseñadora y Analista de Requirimientos**
- GitHub: [@mariaperez30](https://github.com/mariaperez30)

---

## 🙏 Agradecimientos

- **Ionic Framework** por el excelente framework de UI
- **Supabase** por el backend
- **Angular Team** por el framework robusto
- Comunidad open source por las librerías utilizadas

---

## 📞 Soporte

Si tienes preguntas o problemas, puedes:
- Abrir un [Issue](https://github.com/rafael20044/pro-aula6/issues)
- Contactar al autor

---

**Hecho con ❤️ para la comunidad educativa**
