/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Tapizados Nova'

interface Props {
  name?: string
}

const ContactConfirmationEmail = ({ name }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Hemos recibido tu mensaje en {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>{SITE_NAME}</Heading>
          <Text style={tagline}>Tapicería artesanal en Rubí desde 2003</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>
            {name ? `¡Gracias, ${name}!` : '¡Gracias por contactarnos!'}
          </Heading>
          <Text style={text}>
            Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará
            y te responderá en menos de 24 horas con un presupuesto
            personalizado o cualquier información que necesites.
          </Text>
          <Text style={text}>
            Si tu consulta es urgente, también puedes escribirnos por WhatsApp
            al <strong>+34 611 491 661</strong>.
          </Text>
        </Section>
        <Text style={footer}>
          {SITE_NAME} · Calle Bilbao N1, 1ª planta · 08191 Rubí, Barcelona
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: `Hemos recibido tu mensaje — ${SITE_NAME}`,
  displayName: 'Confirmación contacto cliente',
  previewData: { name: 'María' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, Arial, sans-serif',
}
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const header = { textAlign: 'center' as const, padding: '16px 0 24px' }
const brand = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '28px',
  color: 'hsl(222, 17%, 20%)',
  margin: '0',
  fontWeight: 700,
}
const tagline = {
  fontSize: '13px',
  color: 'hsl(39, 44%, 50%)',
  margin: '6px 0 0',
  letterSpacing: '0.05em',
}
const card = {
  backgroundColor: 'hsl(40, 25%, 97%)',
  borderRadius: '12px',
  padding: '32px 28px',
  border: '1px solid hsl(40, 15%, 88%)',
}
const h1 = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '22px',
  color: 'hsl(222, 17%, 20%)',
  margin: '0 0 16px',
  fontWeight: 600,
}
const text = {
  fontSize: '15px',
  color: 'hsl(222, 17%, 25%)',
  lineHeight: '1.6',
  margin: '0 0 14px',
}
const footer = {
  fontSize: '12px',
  color: 'hsl(222, 10%, 50%)',
  textAlign: 'center' as const,
  margin: '24px 0 0',
}
