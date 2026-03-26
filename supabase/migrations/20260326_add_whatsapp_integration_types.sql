-- Add WhatsApp integration channels to integration_type enum
alter type public.integration_type add value if not exists 'whatsapp_baileys';
alter type public.integration_type add value if not exists 'whatsapp_official';
