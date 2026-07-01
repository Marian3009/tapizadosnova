/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Img,
  Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Tapizados Nova'
const SITE_URL = 'https://tapizadosnova.es'

interface Props {
  title?: string
  excerpt?: string
  category?: string
  postUrl?: string
  featuredImageUrl?: string
  featuredImageAlt?: string
  unsubscribeUrl?: string
}

const BlogNewsletterEmail = ({
  title = 'Nuevo artículo en el blog',
  excerpt,
  category,
  postUrl = `${SITE_URL}/blog`,
  featuredImageUrl,
  featuredImageAlt,
  unsubscribeUrl,
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>✨ {title} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={brand}>{SITE_NAME}</Heading>
          <Text style={tagline}>Tapicería artesanal en Rubí · Artículo de la semana</Text>
        </Section>

        {/* Featured image */}
        {featuredImageUrl && (
          <Section style={{ marginBottom: '24px' }}>
            <Link href={postUrl}>
              <Img
                src={featuredImageUrl}
                alt={featuredImageAlt || title}
                width="560"
                style={heroImg}
              />
            </Link>
          </Section>
        )}

        {/* Article card */}
        <Section style={card}>
          {category && <Text style={categoryLabel}>{category}</Text>}
          <Heading style={articleTitle}>{title}</Heading>
          {excerpt && <Text style={excerptText}>{excerpt}</Text>}
          <Section style={{ textAlign: 'center' as const, margin: '24px 0 8px' }}>
            <Button href={postUrl} style={btn}>Leer el artículo completo →</Button>
          </Section>
        </Section>

        <Hr style={hr} />

        {/* Footer */}
        <Text style={footer}>
          {SITE_NAME} · Calle Bilbao N1, 1ª planta · 08191 Rubí (Barcelona){'\n'}
          <Link href={`${SITE_URL}/blog`} style={footerLink}>Ver todos los artículos</Link>
          {unsubscribeUrl && (
            <> · <Link href={unsubscribeUrl} style={footerLink}>Darme de baja</Link></>
          )}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BlogNewsletterEmail,
  subject: (d: Record<string, any>) =>
    `✨ ${d?.title ?? 'Nuevo artículo'} — ${SITE_NAME}`,
  displayName: 'Newsletter semanal suscriptores',
  previewData: {
    title: 'Cómo elegir la tela perfecta para tu sofá',
    excerpt: 'Guía práctica para acertar con el tejido, el color y el acabado en tu próxima renovación.',
    category: 'Consejos',
    postUrl: `${SITE_URL}/blog/como-elegir-tela-sofa`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=560&q=80',
    featuredImageAlt: 'Sofá tapizado moderno',
    unsubscribeUrl: `https://kmiaethuwbmivsoeqxpo.supabase.co/functions/v1/handle-email-unsubscribe?token=demo`,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const header = { textAlign: 'center' as const, padding: '16px 0 24px' }
const brand = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '28px', color: 'hsl(222, 17%, 20%)', margin: '0', fontWeight: 700,
}
const tagline = { fontSize: '12px', color: 'hsl(39, 44%, 50%)', margin: '6px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' as const }
const heroImg = {
  width: '100%', maxWidth: '560px', borderRadius: '12px',
  objectFit: 'cover' as const, display: 'block',
}
const card = {
  backgroundColor: 'hsl(40, 25%, 97%)', borderRadius: '12px',
  padding: '28px', border: '1px solid hsl(40, 15%, 88%)',
}
const categoryLabel = {
  fontSize: '11px', color: 'hsl(39, 44%, 50%)', textTransform: 'uppercase' as const,
  letterSpacing: '0.1em', fontWeight: 700, margin: '0 0 10px',
}
const articleTitle = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '24px', color: 'hsl(222, 17%, 20%)', margin: '0 0 14px', fontWeight: 700, lineHeight: '1.3',
}
const excerptText = {
  fontSize: '15px', color: 'hsl(222, 17%, 30%)', lineHeight: '1.6', margin: '0 0 8px',
}
const btn = {
  backgroundColor: 'hsl(38, 50%, 45%)', color: '#fff',
  padding: '13px 28px', borderRadius: '8px', textDecoration: 'none',
  fontSize: '15px', fontWeight: 600,
}
const hr = { borderColor: 'hsl(40, 15%, 85%)', margin: '24px 0 16px' }
const footer = {
  fontSize: '12px', color: 'hsl(222, 10%, 50%)',
  textAlign: 'center' as const, lineHeight: '1.8', whiteSpace: 'pre-line' as const,
}
const footerLink = { color: 'hsl(39, 44%, 50%)', textDecoration: 'underline' }
