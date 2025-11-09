# Cómo Trabajar con Estilos en Esta Aplicación

Este documento explica cómo se gestionan los estilos en este proyecto Next.js.

## Tecnología Principal: Tailwind CSS v4

Utilizamos [Tailwind CSS](https://tailwindcss.com/) (específicamente la **versión 4**) como framework principal para los estilos. Esto significa que la mayoría de los estilos se aplican mediante **clases de utilidad** directamente en los archivos de componentes (`.tsx`).

## Archivo Global de Estilos: `src/app/globals.css`

Este es el punto de entrada principal para los estilos globales. Contiene:

1.  La importación de Tailwind CSS (`@import "tailwindcss";`).
2.  Definiciones de variables CSS globales (ej: `--background`, `--foreground`) en `:root`.
3.  La configuración principal del **tema de Tailwind v4** dentro de la directiva `@theme`.

## Paleta de Colores

La paleta de colores personalizada de la aplicación (verde, amarillo, etc.) se define como **variables CSS** dentro de la directiva `@theme` en `src/app/globals.css`.

```css
/* src/app/globals.css */
@theme {
  /* ... otras variables ... */

  /* Tus colores personalizados */
  --color-primary-green: #4CAF50; /* Verde original */
  --color-primary-yellow: #FFD600; /* Amarillo abejorro */

  /* ... más variables si se añaden ... */
}
```

**Importante:** Tailwind v4 detecta automáticamente estas variables con el prefijo `--color-` y genera las clases de utilidad correspondientes. Por ejemplo:

*   `--color-primary-green` genera `bg-primary-green`, `text-primary-green`, `border-primary-green`, etc.
*   `--color-primary-yellow` genera `bg-primary-yellow`, `text-primary-yellow`, `border-primary-yellow`, etc.

**No necesitas definir estas clases manualmente.**

## Estructura de Layouts (App Router)

Usamos el sistema de Layouts del App Router de Next.js para gestionar la estructura y los elementos compartidos:

*   **Layout Raíz (`src/app/layout.tsx`):** Aplica la estructura HTML base, fuentes, providers, y los componentes comunes a *todas* las páginas, como el `<Header>` y el `<Footer>`. También define un fondo base `bg-gray-50` que puede ser sobrescrito por layouts o páginas específicas.
*   **Layouts Específicos (ej: `src/app/user/layout.tsx`):** Se aplican a secciones específicas de la aplicación (todas las páginas dentro de `/user` en este caso). Son ideales para definir estilos de fondo, estructuras o componentes *solo* para esa sección. El layout de `/user` actualmente define el fondo con gradiente verde/amarillo y el patrón SVG.
*   **Páginas (ej: `src/app/page.tsx`, `src/app/user/page.tsx`):** Contienen el contenido *único* de cada página. Se renderizan dentro del layout correspondiente.

## Cómo Modificar Estilos

Depende de qué quieras cambiar:

1.  **Para cambiar un color de la paleta global (ej: hacer el verde primario más oscuro):**
    *   Edita el valor de la variable CSS correspondiente (`--color-primary-green`) dentro de `@theme` en `src/app/globals.css`.
    *   Reinicia el servidor de desarrollo. El cambio se aplicará automáticamente en todos los lugares donde se usen las clases `bg-primary-green`, `text-primary-green`, etc.

2.  **Para cambiar el fondo o la estructura de toda una sección (ej: el fondo de `/user`):**
    *   Edita el archivo de layout de esa sección (ej: `src/app/user/layout.tsx`). Modifica las clases de Tailwind aplicadas al `div` contenedor principal en ese archivo.

3.  **Para cambiar el estilo de un componente específico (ej: un botón dentro del Header):**
    *   Localiza el archivo `.tsx` de ese componente (ej: `src/components/layout/Header.tsx`).
    *   Modifica las clases de utilidad de Tailwind directamente en los elementos JSX dentro de ese archivo.

4.  **Para cambiar el estilo del contenido específico de una página (ej: el texto dentro de una tarjeta en `/user`):**
    *   Localiza el archivo `page.tsx` de esa página (ej: `src/app/user/page.tsx`).
    *   Modifica las clases de utilidad de Tailwind aplicadas a los elementos JSX dentro de ese archivo.

## Ejemplo Específico: Fondo de la Sección `/user`

El fondo actual de la sección `/user` (gradiente verde/amarillo + patrón) se define completamente en `src/app/user/layout.tsx`. Las tarjetas blancas y su contenido se definen en `src/app/user/page.tsx`.

---

Siguiendo estos principios, deberías poder gestionar y modificar los estilos de la aplicación de forma coherente. 