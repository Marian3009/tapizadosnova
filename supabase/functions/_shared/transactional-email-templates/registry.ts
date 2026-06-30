/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as contactNotification } from './contact-notification.tsx'
import { template as blogWeeklyPublished } from './blog-weekly-published.tsx'
import { template as budgetNotification } from './budget-notification.tsx'
import { template as budgetConfirmation } from './budget-confirmation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-confirmation': contactConfirmation,
  'contact-notification': contactNotification,
  'blog-weekly-published': blogWeeklyPublished,
  'budget-notification': budgetNotification,
  'budget-confirmation': budgetConfirmation,
}
