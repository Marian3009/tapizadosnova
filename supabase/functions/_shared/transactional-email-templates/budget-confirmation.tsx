/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  numero?: string
  fecha?: string
  nombre?: string
  muebleLabel?: string
  telaLabel?: string
  tejidoNombre?: string
  metraje?: string
  unidades?: string
  total?: string
  anticipo?: string
  iban?: string
}

const Field = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <Text style={rowText}>
      <strong style={label_}>{label}:</strong> {value}
    </Text>
  ) : null

const BudgetConfirmationEmail = ({
  numero, fecha, nombre, muebleLabel, telaLabel, tejidoNombre,
  metraje, unidades, total, anticipo, iban,
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu presupuesto de Tapizados Nova #{numero} está listo</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>Tapizados <em>Nova</em></Heading>
        <Heading style={h1}>Tu presupuesto está listo</Heading>

        <Text style={intro}>
          Hola {nombre || 'cliente'}, hemos recibido tu solicitud y hemos preparado el siguiente presupuesto orientativo para tu proyecto.
        </Text>

        <Section style={card}>
          <Text style={sectionTitle}>Referencia #{numero} · {fecha}</Text>
          <Hr style={hr} />
          <Field label="Mueble" value={muebleLabel} />
          <Field label="Categoría de tela" value={telaLabel} />
          <Field label="Tejido seleccionado" value={tejidoNombre} />
          <Field label="Metraje estimado" value={metraje ? `${metraje} m` : undefined} />
          <Field label="Unidades" value={unidades} />
          <Hr style={hr} />
          <Text style={totalLine}>
            Total estimado (IVA incluido): <strong style={totalAmount}>{total} €</strong>
          </Text>
          {anticipo && (
            <Text style={rowText}>
              Anticipo requerido (50%): <strong>{anticipo} €</strong>
            </Text>
          )}
          {iban && iban !== 'Consultar con el taller' && (
            <Text style={rowText}>
              IBAN: <strong>{iban}</strong>
            </Text>
          )}
        </Section>

        <Section style={nextSteps}>
          <Text style={sectionTitle}>Próximos pasos</Text>
          <Text style={step}>1. Nos pondremos en contacto contigo en menos de 24 h para confirmar los detalles.</Text>
          <Text style={step}>2. Podrás ver las telas disponibles y elegir la definitiva en nuestro taller.</Text>
          <Text style={step}>3. Una vez confirmado, comenzamos el trabajo con la máxima atención.</Text>
        </Section>

        <Text style={contact}>
          ¿Tienes alguna pregunta?{' '}
          <Link href="https://wa.me/34611491661" style={link}>WhatsApp: +34 611 491 661</Link>
          {' '}·{' '}
          <Link href="mailto:tapizadosnova@gmail.com" style={link}>tapizadosnova@gmail.com</Link>
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          © Tapizados Nova · Calle Bilbao N1, 1ª planta, 08191 Rubí (Barcelona){'\n'}
          Presupuesto orientativo, precio final sujeto a revisión en taller.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BudgetConfirmationEmail,
  subject: (d: Record<string, any>) =>
    `Tu presupuesto Tapizados Nova #${d?.numero ?? ''} — ${d?.total ?? ''}€ (IVA inc.)`,
  displayName: 'Confirmación presupuesto cliente',
  previewData: {
    numero: 'TN-2026-001',
    fecha: '30/06/2026',
    nombre: 'María',
    muebleLabel: 'Sofá 3 plazas',
    telaLabel: 'Antimanchas',
    tejidoNombre: 'Colección Amara · REF-01 · Beige',
    metraje: '7.50',
    unidades: '1',
    total: '544.50',
    anticipo: '272.25',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const brand = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '26px',
  color: 'hsl(39, 44%, 59%)',
  margin: '0 0 4px',
  fontWeight: 600,
  letterSpacing: '-0.02em',
}
const h1 = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '20px',
  color: 'hsl(222, 17%, 20%)',
  margin: '0 0 16px',
  fontWeight: 600,
}
const intro = { fontSize: '15px', color: 'hsl(222, 17%, 30%)', lineHeight: '1.6', margin: '0 0 20px' }
const card = {
  backgroundColor: 'hsl(40, 25%, 97%)',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid hsl(40, 15%, 88%)',
  marginBottom: '20px',
}
const nextSteps = {
  backgroundColor: 'hsl(222, 17%, 14%)',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '20px',
}
const sectionTitle = {
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: 'hsl(39, 44%, 59%)',
  margin: '0 0 12px',
  fontWeight: 700,
}
const rowText = { fontSize: '14px', color: 'hsl(222, 17%, 25%)', margin: '0 0 6px', lineHeight: '1.5' }
const label_ = { color: 'hsl(222, 17%, 20%)', fontSize: '14px' }
const totalLine = { fontSize: '15px', color: 'hsl(222, 17%, 20%)', margin: '12px 0 4px', fontWeight: 500 }
const totalAmount = { color: 'hsl(39, 44%, 50%)', fontSize: '18px' }
const step = { fontSize: '14px', color: 'hsl(40, 25%, 90%)', margin: '0 0 8px', lineHeight: '1.6' }
const contact = { fontSize: '13px', color: 'hsl(222, 10%, 45%)', margin: '16px 0' }
const link = { color: 'hsl(39, 44%, 50%)', textDecoration: 'underline' }
const hr = { borderColor: 'hsl(40, 15%, 85%)', margin: '16px 0' }
const footer = {
  fontSize: '11px',
  color: 'hsl(222, 10%, 55%)',
  textAlign: 'center' as const,
  whiteSpace: 'pre-line' as const,
  margin: '20px 0 0',
  lineHeight: '1.8',
}
