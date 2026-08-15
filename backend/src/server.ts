import express from 'express'; import cors from 'cors'; import {PrismaClient} from '@prisma/client'; import {z} from 'zod';
const app=express(); const prisma=new PrismaClient(); app.use(cors()); app.use(express.json({limit:'2mb'}));
const item=z.object({areaType:z.string().default(''),name:z.string().min(1),vendor:z.string().optional().default(''),description:z.string().optional().default(''),unit:z.string().default('Nos.'),quantity:z.number().nonnegative().default(1),price:z.number().nonnegative().default(0)});
const quote=z.object({invoiceNo:z.string(),client:z.string(),phone:z.string().optional(),projectType:z.string().optional(),location:z.string().optional(),area:z.number().optional(),validity:z.string().optional(),terms:z.string().optional(),totals:z.record(z.string(),z.number()),items:z.array(item.extend({qty:z.number().nonnegative().optional(),rate:z.number().nonnegative().optional()}))});
app.get('/health',(_,res)=>res.json({ok:true,service:'design-mantra-api'}));
app.get('/api/items',async(req,res)=>{const q=String(req.query.q??''); const data=await prisma.priceList.findMany({where:q?{OR:[{name:{contains:q,mode:'insensitive'}},{vendor:{contains:q,mode:'insensitive'}},{areaType:{contains:q,mode:'insensitive'}}]}:undefined,orderBy:{name:'asc'}});res.json(data)});
app.post('/api/items',async(req,res)=>{const x=item.parse(req.body);res.status(201).json(await prisma.priceList.create({data:x}))});
app.put('/api/items/:id',async(req,res)=>{const x=item.partial().parse(req.body);res.json(await prisma.priceList.update({where:{id:req.params.id},data:x}))});
app.delete('/api/items/:id',async(req,res)=>{await prisma.priceList.delete({where:{id:req.params.id}});res.status(204).end()});
app.get('/api/recent-items',async(_,res)=>res.json(await prisma.recentItem.findMany({orderBy:{createdAt:'desc'},take:100})));
app.post('/api/recent-items',async(req,res)=>{const x=item.parse(req.body);res.status(201).json(await prisma.recentItem.create({data:x}))});
app.get('/api/quotes',async(req,res)=>{const days=Math.min(Math.max(Number(req.query.days??30),1),3650);res.json(await prisma.quote.findMany({where:{createdAt:{gte:new Date(Date.now()-days*86400000)}},orderBy:{createdAt:'desc'}}))});
app.get('/api/quotes/:id',async(req,res)=>res.json(await prisma.quote.findUniqueOrThrow({where:{id:req.params.id}})));
app.post('/api/quotes/import',async(req,res)=>{const x=quote.parse(req.body);res.status(201).json(await prisma.quote.create({data:{...x,items:x.items,totals:x.totals}}))});
app.delete('/api/quotes/:id',async(req,res)=>{await prisma.quote.delete({where:{id:req.params.id}});res.status(204).end()});
async function documentProxy(path:string,req:express.Request,res:express.Response){const r=await fetch(`${process.env.DOC_SERVICE_URL??'http://localhost:8000'}${path}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(req.body)});res.status(r.status);res.setHeader('content-type',r.headers.get('content-type')??'application/octet-stream');res.send(Buffer.from(await r.arrayBuffer()))}
app.post('/api/estimate-pdf',(req,res)=>documentProxy('/generate/pdf',req,res)); app.post('/api/estimate-docx',(req,res)=>documentProxy('/generate/docx',req,res));
app.use((e:any,_req:any,res:any)=>res.status(400).json({error:e?.message??'Request failed'}));
app.listen(Number(process.env.PORT??4000),()=>console.log('API listening on 4000'));
