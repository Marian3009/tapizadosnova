/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  numero?: string
  fecha?: string
  nombre?: string
  email?: string
  telefono?: string
  direccion?: string
  muebleLabel?: string
  telaLabel?: string
  tejidoNombre?: string
  modalidad?: string
  metraje?: string
  unidades?: string
  base?: string
  iva?: string
  total?: string
  anticipo?: string
}

const Field = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <Text style={rowText}>
      <strong style={label_}>{label}:</strong> {value}
    </Text>
  ) : null

const BudgetNotificationEmail = ({
  numero, fecha, nombre, email, telefono, direccion,
  muebleLabel, telaLabel, tejidoNombre, modalidad,
  metraje, unidades, base, iva, total, anticipo,
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Presupuesto #{numero} — {nombre}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nuevo presupuesto solicitado</Heading>

        <Section style={badge}>
          <Text style={badgeText}>#{numero} · {fecha}</Text>
        </Section>

        <Section style={card}>
          <Text style={sectionTitle}>Cliente</Text>
          <Field label="Nombre" value={nombre} />
          <Field label="Email" value={email} />
          <Field label="Teléfono" value={telefono} />
          <Field label="Dirección" value={direccion} />

          <Hr style={hr} />

          <Text style={sectionTitle}>Proyecto</Text>
          <Field label="Mueble" value={muebleLabel} />
          <Field label="Tipo" value={modalidad === 'funda' ? 'Funda ajustable' : 'Tapizado'} />
          <Field label="Categoría de tela" value={telaLabel} />
          <Field label="Tejido seleccionado" value={tejidoNombre} />
          <Field label="Metraje estimado" value={metraje ? `${metraje} m` : undefined} />
          <Field label="Unidades" value={unidades} />

          <Hr style={hr} />

          <Text style={sectionTitle}>Precio</Text>
          <Field label="Base (sin IVA)" value={base ? `${base} €` : undefined} />
          <Field label="IVA (21%)" value={iva ? `${iva} €` : undefined} />
          <Field label="Total" value={total ? `${total} €` : undefined} />
          <Field label="Anticipo (50%)" value={anticipo ? `${anticipo} €` : undefined} />
        </Section>

        <Text style={footer}>Presupuesto generado en tapizadosnova.es</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BudgetNotificationEmail,
  subject: (d: Record<string, any>) =>
    `Presupuesto #${d?.numero ?? ''}${d?.nombre ? ` — ${d.nombre}` : ''} · ${d?.total ?? ''}€`,
  to: 'tapizadosnova@gmail.com',
  displayName: 'Notificación interna presupuesto',
  previewData: {
    numero: 'TN-2026-001',
    fecha: '30/06/2026',
    nombre: 'María García',
    email: 'maria@example.com',
    telefono: '+34 600 000 000',
    muebleLabel: 'Sofá 3 plazas',
    telaLabel: 'Antimanchas',
    tejidoNombre: 'Colección Amara · REF-01 · Beige',
    modalidad: 'tapizado',
    metraje: '7.50',
    unidades: '1',
    base: '450.00',
    iva: '94.50',
    total: '544.50',
    anticipo: '272.25',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const h1 = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '22px',
  color: 'hsl(222, 17%, 20%)',
  margin: '0 0 16px',
  fontWeight: 600,
}
const badge = {
  backgroundColor: 'hsl(39, 44%, 59%)',
  borderRadius: '8px',
  padding: '8px 16px',
  marginBottom: '20px',
  display: 'inline-block',
}
const badgeText = { color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0 }
const card = {
  backgroundColor: 'hsl(40, 25%, 97%)',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid hsl(40, 15%, 88%)',
}
const sectionTitle = {
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: 'hsl(39, 44%, 50%)',
  margin: '0 0 8px',
  fontWeight: 600,
}
const rowText = { fontSize: '14px', color: 'hsl(222, 17%, 25%)', margin: '0 0 6px', lineHeight: '1.5' }
const label_ = { color: 'hsl(222, 17%, 20%)', fontSize: '14px' }
const hr = { borderColor: 'hsl(40, 15%, 85%)', margin: '16px 0' }
const footer = {
  fontSize: '12px',
  color: 'hsl(222, 10%, 50%)',
  textAlign: 'center' as const,
  margin: '20px 0 0',
}
