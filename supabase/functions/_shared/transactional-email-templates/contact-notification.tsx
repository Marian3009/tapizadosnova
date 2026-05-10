/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  email?: string
  telefono?: string
  tipo?: string
  descripcion?: string
  origen?: string
}

const Row = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <Text style={rowText}>
      <strong style={rowLabel}>{label}:</strong> {value}
    </Text>
  ) : null

const ContactNotificationEmail = ({
  name, email, telefono, tipo, descripcion, origen,
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nueva solicitud de presupuesto{name ? ` de ${name}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nueva solicitud de presupuesto</Heading>
        <Section style={card}>
          <Row label="Nombre" value={name} />
          <Row label="Email" value={email} />
          <Row label="Teléfono" value={telefono} />
          <Row label="Tipo de trabajo" value={tipo} />
          <Row label="¿Cómo nos conoció?" value={origen} />
          <Hr style={hr} />
          <Text style={rowLabel}>Descripción:</Text>
          <Text style={desc}>{descripcion || '—'}</Text>
        </Section>
        <Text style={footer}>
          Recibido desde el formulario de contacto de tapizadosnova.es
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNotificationEmail,
  subject: (d: Record<string, any>) =>
    `Nueva solicitud${d?.name ? ` — ${d.name}` : ''}${d?.tipo ? ` (${d.tipo})` : ''}`,
  displayName: 'Notificación interna contacto',
  previewData: {
    name: 'María García',
    email: 'maria@example.com',
    telefono: '+34 600 000 000',
    tipo: 'Sofá',
    descripcion: 'Sofá de 3 plazas para tapizar, mide aprox. 220cm.',
    origen: 'Google',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const h1 = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '22px',
  color: 'hsl(222, 17%, 20%)',
  margin: '0 0 20px',
  fontWeight: 600,
}
const card = {
  backgroundColor: 'hsl(40, 25%, 97%)',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid hsl(40, 15%, 88%)',
}
const rowText = { fontSize: '14px', color: 'hsl(222, 17%, 25%)', margin: '0 0 8px', lineHeight: '1.5' }
const rowLabel = { color: 'hsl(222, 17%, 20%)', fontSize: '14px' }
const desc = {
  fontSize: '14px',
  color: 'hsl(222, 17%, 25%)',
  lineHeight: '1.6',
  margin: '6px 0 0',
  whiteSpace: 'pre-wrap' as const,
}
const hr = { borderColor: 'hsl(40, 15%, 85%)', margin: '16px 0' }
const footer = {
  fontSize: '12px',
  color: 'hsl(222, 10%, 50%)',
  textAlign: 'center' as const,
  margin: '20px 0 0',
}
