import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { renderSb2nov } from './render.js';
import { ResumeData } from './types.js';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const ResumeSchema = z.object({
  templateId: z.literal('sb2nov'),
  options: z
    .object({
      color: z.string().optional(),
      showLinks: z.boolean().optional(),
      sectionOrder: z.array(z.string()).optional(),
    })
    .optional(),
  data: z.object({
    basics: z.object({
      name: z.string().min(1),
      headline: z.string().optional(),
      location: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.string().url() })).optional(),
    }),
    summary: z.string().optional(),
    experience: z
      .array(
        z.object({
          company: z.string(),
          position: z.string(),
          location: z.string().optional(),
          startDate: z.string(),
          endDate: z.string().nullable(),
          bullets: z.array(z.string()).default([]),
        })
      )
      .optional(),
    education: z
      .array(
        z.object({
          institution: z.string(),
          degree: z.string(),
          area: z.string().optional(),
          location: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          notes: z.array(z.string()).optional(),
        })
      )
      .optional(),
    projects: z
      .array(
        z.object({
          name: z.string(),
          link: z.string().url().optional(),
          description: z.string().optional(),
          bullets: z.array(z.string()).optional(),
          tech: z.array(z.string()).optional(),
        })
      )
      .optional(),
    skills: z
      .object({
        groups: z.array(z.object({ label: z.string(), items: z.array(z.string()) })),
      })
      .optional(),
    extras: z
      .array(
        z.object({
          type: z.string(),
          items: z.array(z.object({ label: z.string(), value: z.string().optional(), dates: z.string().optional() })),
        })
      )
      .optional(),
  }),
});

app.post('/render', async (req, reply) => {
  const parsed = ResumeSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const payload = parsed.data as ResumeData;
  try {
    const pdf = await renderSb2nov(payload);
    reply.header('Content-Type', 'application/pdf');
    reply.send(pdf);
  } catch (err: any) {
    req.log.error({ err }, 'Failed to render');
    reply.status(500).send({ error: 'Render failed', message: err?.message });
  }
});

app.get('/health', async () => ({ ok: true }));

// Warm-up compile to pre-fetch Tectonic packages
async function warmUp() {
  const payload: ResumeData = {
    templateId: 'sb2nov',
    data: {
      basics: { name: 'Warm Up', headline: 'Init', email: 'warm@up.test', phone: 'N/A' },
      summary: 'Warm-up compile to prime Tectonic cache.',
      experience: [],
      education: [],
      projects: [],
      skills: { groups: [] },
      extras: [],
    },
  };
  try {
    await renderSb2nov(payload);
    app.log.info('Warm-up compile complete');
  } catch (e) {
    app.log.warn('Warm-up compile failed (will retry on first real request)');
  }
}

app.listen({ port: 3001, host: '127.0.0.1' }).then(() => {
  warmUp();
}).catch((err) => {
  app.log.error(err);
  process.exit(1);
});


