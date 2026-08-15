import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const item = z.object({
  areaType: z.string().default(''),
  name: z.string().min(1),
  vendor: z.string().optional().default(''),
  description: z.string().optional().default(''),
  unit: z.string().default('Nos.'),
  quantity: z.number().nonnegative().default(1),
  price: z.number().nonnegative().default(0),
});

const quote = z.object({
  invoiceNo: z.string(),
  client: z.string(),
  phone: z.string().optional(),
  projectType: z.string().optional(),
  location: z.string().optional(),
  area: z.number().optional(),
  validity: z.string().optional(),
  terms: z.string().optional(),
  totals: z.record(z.string(), z.number()),
  items: z.array(item.extend({
    qty: z.number().nonnegative().optional(),
    rate: z.number().nonnegative().optional(),
  })),
});

app.get('/health', (_, res) => res.json({ ok: true, service: 'design-mantra-api' }));

app.get('/api/items', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '');
    const data = await prisma.priceList.findMany({
      where: q ? { OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { vendor: { contains: q, mode: 'insensitive' } },
        { areaType: { contains: q, mode: 'insensitive' } },
      ] } : undefined,
      orderBy: { name: 'asc' },
    });
    res.json(data);
  } catch (error) { next(error); }
});

app.post('/api/items', async (req, res, next) => {
  try { res.status(201).json(await prisma.priceList.create({ data: item.parse(req.body) })); }
  catch (error) { next(error); }
});

app.put('/api/items/:id', async (req, res, next) => {
  try { res.json(await prisma.priceList.update({ where: { id: req.params.id }, data: item.partial().parse(req.body) })); }
  catch (error) { next(error); }
});

app.delete('/api/items/:id', async (req, res, next) => {
  try { await prisma.priceList.delete({ where: { id: req.params.id } }); res.status(204).end(); }
  catch (error) { next(error); }
});

app.get('/api/recent-items', async (_, res, next) => {
  try { res.json(await prisma.recentItem.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })); }
  catch (error) { next(error); }
});

app.post('/api/recent-items', async (req, res, next) => {
  try { res.status(201).json(await prisma.recentItem.create({ data: item.parse(req.body) })); }
  catch (error) { next(error); }
});

app.get('/api/quotes', async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days ?? 30), 1), 3650);
    res.json(await prisma.quote.findMany({
      where: { createdAt: { gte: new Date(Date.now() - days * 86400000) } },
      orderBy: { createdAt: 'desc' },
    }));
  } catch (error) { next(error); }
});

app.get('/api/quotes/:id', async (req, res, next) => {
  try { res.json(await prisma.quote.findUniqueOrThrow({ where: { id: req.params.id } })); }
  catch (error) { next(error); }
});

app.post('/api/quotes/import', async (req, res, next) => {
  try {
    const x = quote.parse(req.body);
    res.status(201).json(await prisma.quote.create({ data: { ...x, items: x.items, totals: x.totals } }));
  } catch (error) { next(error); }
});

app.delete('/api/quotes/:id', async (req, res, next) => {
  try { await prisma.quote.delete({ where: { id: req.params.id } }); res.status(204).end(); }
  catch (error) { next(error); }
});

async function documentProxy(path: string, req: express.Request, res: express.Response) {
  const r = await fetch(`${process.env.DOC_SERVICE_URL ?? 'http://localhost:8000'}${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(req.body),
  });
  res.status(r.status);
  res.setHeader('content-type', r.headers.get('content-type') ?? 'application/octet-stream');
  res.send(Buffer.from(await r.arrayBuffer()));
}

app.post('/api/estimate-pdf', (req, res, next) => documentProxy('/generate/pdf', req, res).catch(next));
app.post('/api/estimate-docx', (req, res, next) => documentProxy('/generate/docx', req, res).catch(next));

app.use((e: unknown, _req: express.Request, res: express.Response) =>
  res.status(400).json({ error: e instanceof Error ? e.message : 'Request failed' }),
);

const port = Number(process.env.PORT ?? 4000);
const server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

process.on('SIGTERM', async () => { await prisma.$disconnect(); server.close(); });
process.on('SIGINT', async () => { await prisma.$disconnect(); server.close(); });
