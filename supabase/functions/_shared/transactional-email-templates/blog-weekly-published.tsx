/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  title?: string
  slug?: string
  category?: string
  excerpt?: string
  weekNumber?: number
  postUrl?: string
}

const BlogWeeklyPublishedEmail = ({
  title, slug, category, excerpt, weekNumber, postUrl,
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nuevo artículo publicado: {title || 'sin título'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📝 Nuevo artículo publicado</Heading>
        <Text style={intro}>
          La automatización semanal del blog ha publicado un nuevo artículo
          {weekNumber ? ` correspondiente a la semana ${weekNumber}` : ''}.
        </Text>
        <Section style={card}>
          <Text style={rowLabel}>Título</Text>
          <Text style={titleText}>{title || '—'}</Text>
          {category && (
            <>
              <Text style={rowLabel}>Categoría</Text>
              <Text style={rowText}>{category}</Text>
            </>
          )}
          {excerpt && (
            <>
              <Text style={rowLabel}>Extracto</Text>
              <Text style={rowText}>{excerpt}</Text>
            </>
          )}
          {slug && (
            <>
              <Text style={rowLabel}>URL</Text>
              <Text style={rowText}>/blog/{slug}</Text>
            </>
          )}
        </Section>
        {postUrl && (
          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Button href={postUrl} style={btn}>Ver artículo</Button>
          </Section>
        )}
        <Text style={footer}>
          Tapizados Nova · Automatización semanal del blog
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BlogWeeklyPublishedEmail,
  subject: (d: Record<string, any>) =>
    `📝 Nuevo artículo publicado${d?.title ? `: ${d.title}` : ''}`,
  displayName: 'Aviso interno publicación semanal',
  previewData: {
    title: 'Cómo elegir el tejido perfecto para tu sofá',
    slug: 'como-elegir-tejido-sofa',
    category: 'Consejos',
    excerpt: 'Una guía práctica para acertar con la tapicería de tu salón.',
    weekNumber: 12,
    postUrl: 'https://tapizadosnova.es/blog/como-elegir-tejido-sofa',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const h1 = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '22px',
  color: 'hsl(222, 17%, 20%)',
  margin: '0 0 12px',
  fontWeight: 600,
}
const intro = { fontSize: '14px', color: 'hsl(222, 17%, 35%)', lineHeight: '1.6', margin: '0 0 16px' }
const card = {
  backgroundColor: 'hsl(40, 25%, 97%)',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid hsl(40, 15%, 88%)',
}
const rowLabel = {
  color: 'hsl(38, 50%, 45%)',
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '12px 0 4px',
  fontWeight: 600,
}
const titleText = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '18px',
  color: 'hsl(222, 17%, 20%)',
  margin: '0 0 4px',
  fontWeight: 600,
}
const rowText = { fontSize: '14px', color: 'hsl(222, 17%, 25%)', margin: '0', lineHeight: '1.5' }
const btn = {
  backgroundColor: 'hsl(38, 50%, 45%)',
  color: '#fff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
}
const footer = {
  fontSize: '12px',
  color: 'hsl(222, 10%, 50%)',
  textAlign: 'center' as const,
  margin: '24px 0 0',
}
