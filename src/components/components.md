# Documentación de Componentes

Este documento describe los componentes principales de la aplicación QuiniCat, explicando su funcionalidad, características y uso.

## Componentes de Navegación

### Header (`Header.tsx`)

El componente Header es la barra de navegación principal de la aplicación.

**Características:**
- Barra de navegación responsiva con menú hamburguesa para móviles
- Logo de la aplicación
- Enlaces de navegación principales
- Botón de autenticación
- Diseño con gradiente verde y borde amarillo
- Adaptable a diferentes tamaños de pantalla

**Uso:**
```tsx
<Header />
```

**Props:**
No requiere props.

### Footer (`Footer.tsx`)

El componente Footer proporciona información de contacto y enlaces adicionales.

**Características:**
- Cuatro columnas de información
- Enlaces rápidos
- Información de contacto
- Redes sociales
- Copyright dinámico
- Diseño responsivo
- Iconos SVG para redes sociales

**Uso:**
```tsx
<Footer />
```

**Props:**
No requiere props.

## Componentes de Contenido

### Hero (`Hero.tsx`)

El componente Hero es la sección principal de la página de inicio.

**Características:**
- Carrusel de imágenes de fondo
- Patrón de balones de fútbol
- Título y descripción principal
- Botones de llamada a la acción
- Video de introducción
- Diseño responsivo
- Gradientes y efectos visuales

**Uso:**
```tsx
<Hero />
```

**Props:**
No requiere props.

### ImageCarousel (`ImageCarousel.tsx`)

Componente que muestra un carrusel de imágenes de fondo.

**Características:**
- Transiciones suaves entre imágenes
- Cambio automático cada 5 segundos
- Efecto de difuminado para mejorar la legibilidad
- Optimización de imágenes con Next.js
- Modo cliente (client-side)

**Uso:**
```tsx
<ImageCarousel />
```

**Props:**
No requiere props.

### MatchStats (`MatchStats.tsx`)

Componente que muestra los últimos resultados de partidos.

**Características:**
- Tarjetas de resultados de partidos
- Diseño responsivo
- Soporte para modo oscuro
- Logos de equipos
- Información detallada de partidos
- Botón para ver más resultados

**Uso:**
```tsx
<MatchStats />
```

**Props:**
No requiere props.

## Componentes de Autenticación

### AuthButton (`auth/AuthButton.tsx`)

Componente para gestionar la autenticación de usuarios.

**Características:**
- Integración con el sistema de autenticación
- Estado de sesión dinámico
- Botones de login/logout
- Diseño consistente con la aplicación

**Uso:**
```tsx
<AuthButton />
```

**Props:**
No requiere props.

## Estilos y Temas

Todos los componentes utilizan Tailwind CSS para los estilos y siguen una paleta de colores consistente:

- Verde principal: `#4CAF50`
- Amarillo acento: `#FFD600`
- Fondo oscuro: `#gray-900`
- Texto claro: `#white`
- Texto secundario: `#gray-300`

Los componentes son compatibles con el modo oscuro y utilizan clases de Tailwind para la responsividad.

## Consideraciones de Rendimiento

- Los componentes utilizan lazy loading para imágenes
- Se implementan transiciones suaves
- Se optimizan las imágenes con Next.js
- Se utiliza el modo cliente solo cuando es necesario
- Se implementan efectos de carga progresiva

## Mejoras Futuras

1. Implementar animaciones más suaves
2. Añadir más opciones de personalización
3. Mejorar la accesibilidad
4. Optimizar el rendimiento en dispositivos móviles
5. Añadir más interacciones y efectos visuales 