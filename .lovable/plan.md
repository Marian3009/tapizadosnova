# Plan de implementación – Tapizados Nova

## 1. Calculadora rediseñada (`src/components/site/Calculator.tsx`)

Reescribir el componente eliminando el campo de m². Nueva estructura:

**Paso 1 – Tipo de mueble (Select de shadcn)**
Opciones con metraje interno (objeto en código):
```
sillon_orejero: 6.00, descalzadora: 3.50, butaca_pequena: 4.50,
butaca_xl: 8.00, sofa2: 11.00, sofa3: 14.00, chaise: 10.00,
silla_asiento: 0.60, silla_asiento_respaldo: 1.20,
cabezal_individual: 1.50, cabezal_135: 2.00,
cabezal_150: 2.40, cabezal_200: 3.50
```
Al seleccionar muestra: "📐 Metraje estimado de tejido: X,XX metros" + nota orientativa en gris.

**Paso 2 – Tipo de tela (4 tarjetas radio)**
Categorías con icono + descripción + "desde X €/metro":
- basico (20), antimanchas (35), terciopelo (35), premium (70)
Tarjeta seleccionada: borde `border-gold`, fondo `bg-cream`, texto navy.

**Paso 3 – Cantidad de unidades** (input number, min 1).

**Paso 4 – Visualizador de tejidos** (sección "Elige tu tejido")
- Lee `localStorage.tn_fabrics` (array de tejidos del admin).
- Filtra por categoría seleccionada.
- Grid de miniaturas; al hacer click se marca con borde dorado.
- Previsualización: rectángulo con `background-image: url(tejido)` cover y label con nombre del mueble.
- Vacío → "El catálogo de tejidos estará disponible próximamente".

**Cálculo (interno, sin desglose visible)**
```
total = metraje × precio_metro × 1.40 × unidades
```
Mostrar solo: "Precio estimado: XXX €" (redondeado).

**Paso 5 – Botón "Solicitar presupuesto detallado"** abre un Dialog (shadcn) con el formulario del cliente (nombre*, email*, teléfono, dirección) validado con zod. Botones finales: "📄 Descargar PDF" y "📧 Enviar al email del cliente".

## 2. Generación de PDF (`src/lib/generateBudgetPdf.ts`)

Usar `jspdf` (añadir dependencia). Función `generateBudgetPdf({ cliente, mueble, tela, tejido, metraje, unidades, base, iva, total, anticipo, iban, numero })` que construye:
- Cabecera navy con datos de Tapizados Nova (Calle Bilbao N1, 1ª planta, 08191 Rubí; +34 611 491 661; tapizadosnova@gmail.com).
- Caja: Nº `PRES-YYYYMMDD-XXX` (XXX random 3 dígitos) y fecha.
- Sección datos cliente.
- Detalle del trabajo (mueble, tela, tejido si hay, metraje, unidades).
- Desglose: Base, IVA 21%, TOTAL en negrita y grande dorado.
- Anticipo 50%, titular, IBAN (de localStorage `tn_iban` o "Consultar con el taller"), concepto.
- Caja con borde dorado: notas legales (orientativo, validez 30 días, anticipo 50%).
- Pie: "Tapizados Nova – Tapicería artesanal en Rubí, Barcelona desde 2003".

Devuelve el `jsPDF` para `.save()` o `.output('datauristring')`.

## 3. Envío por email

Sin EmailJS configurado: implementar fallback que muestre toast verde:
"✅ Presupuesto enviado a [email]. Recibirás una copia en breves." y descargue también el PDF localmente.
(Dejar comentado un placeholder con la integración EmailJS para activarla cuando el usuario aporte SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY.)

Tras descargar/enviar mostrar banner verde:
"✅ Presupuesto generado correctamente. Nos pondremos en contacto contigo para confirmar los detalles."

## 4. Panel de administración `/admin`

**Ruta** añadida en `src/App.tsx`:
```
<Route path="/admin" element={<Admin />} />
```

**`src/pages/Admin.tsx`**
- Login simple: input password, si === `admin2024` setea `sessionStorage.tn_admin = '1'` y muestra panel. (Aviso de que no es seguridad real.)
- Dos pestañas (Tabs shadcn): "Catálogo de tejidos" y "Configuración IBAN".

**Catálogo de tejidos**
- Form: nombre*, categoría (Select: basico/antimanchas/terciopelo/premium), color (input color), imagen (input file → leer como dataURL), descripción (≤100 chars).
- Guardar en `localStorage.tn_fabrics` como `[{id, nombre, categoria, color, imagen, descripcion}]`.
- Lista con miniatura, nombre, categoría, botones Editar/Eliminar.

**Configuración IBAN**
- Input texto con valor actual (`localStorage.tn_iban`), botón "Guardar IBAN", toast de confirmación.

Estilo: paleta navy/dorado/crema, tipografías Playfair + Inter, `rounded-lg`, sombras suaves, responsive.

## 5. Dependencias a instalar

- `jspdf` (PDF en cliente).

(EmailJS opcional – no se instala hasta que el usuario aporte credenciales.)

## 6. Archivos afectados

```text
modificar:
  src/components/site/Calculator.tsx   (reescritura completa)
  src/App.tsx                          (ruta /admin)
crear:
  src/pages/Admin.tsx
  src/lib/generateBudgetPdf.ts
  src/components/site/BudgetDialog.tsx (formulario cliente + acciones PDF/email)
```

## 7. Notas

- Todo el almacenamiento usa `localStorage` (cliente). No requiere backend.
- `/admin` con password en cliente es solo una barrera visual (la propietaria puede usarlo en su navegador). Si más adelante se quiere seguridad real, conviene activar Lovable Cloud + auth.
- EmailJS requiere claves del usuario; mientras tanto el botón "Enviar al email" descarga el PDF y simula confirmación.
