import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import * as dotenv from "dotenv";

const server = fastify()
const prisma = new PrismaClient()
dotenv.config()

function ValidatePassphrase(passphrase : String | undefined) {
    return passphrase === process.env['PASSPHRASE'];
}

server.get('/:ownerId', async (request, reply) => {
    const params : any = request.params
    const ownerId = params.ownerId
    const entries = await prisma.entry.findMany({
        where: {
            ownerId: ownerId
        },
        orderBy: [{
            key: 'asc'
        }]
    })
    reply.code(200).send(entries)
})

server.get('/:ownerId/:key', async (request, reply) => {
    const params : any = request.params
    const ownerId = params.ownerId
    const key = params.key
    const entry = await prisma.entry.findFirst({
        where: {
            ownerId: ownerId,
            key: key
        }
    })
    reply.code(200).send(entry)
})

server.post('/', async (request, reply) => {
    if (!ValidatePassphrase(request.headers.authorization)) {
        reply.code(401).send()
        return
    }
    // Create or set value 
    const body : any = request.body
    const ownerId = body.ownerId
    const key = body.key
    const value = body.value
    let entry = await prisma.entry.findFirst({
        where: {
            ownerId: ownerId,
            key: key
        }
    })
    if (entry) {
        entry = await prisma.entry.update({
            where: { id: Number(entry.id) },
            data: {
                ownerId: ownerId,
                key: key,
                value: String(value)
            }
        })
    } else {
        entry = await prisma.entry.create({
            data: {
                ownerId: ownerId,
                key: key,
                value: String(value)
            }
        })
    }
    reply.code(200).send(entry)
})

server.patch('/', async (request, reply) => {
    if (!ValidatePassphrase(request.headers.authorization)) {
        reply.code(401).send()
        return
    }
    // Increase value if value type is numeric, set value if value type is string
    const body : any = request.body
    const ownerId = body.ownerId
    const key = body.key
    let value = body.value
    let entry = await prisma.entry.findFirst({
        where: {
            ownerId: ownerId,
            key: key
        }
    })
    if (entry) {
        if (!isNaN(Number(entry.value)) && !isNaN(Number(value))) {
            value = Number(entry.value) + Number(value)
        }
        entry = await prisma.entry.update({
            where: { id: Number(entry.id) },
            data: {
                ownerId: ownerId,
                key: key,
                value: String(value)
            }
        })
    } else {
        entry = await prisma.entry.create({
            data: {
                ownerId: ownerId,
                key: key,
                value: String(value)
            }
        })
    }
    reply.code(200).send(entry)
})

server.delete('/', async (request, reply) => {
    if (!ValidatePassphrase(request.headers.authorization)) {
        reply.code(401).send()
        return
    }
    // Delete value
    const body : any = request.body
    const ownerId = body.ownerId
    const key = body.key
    await prisma.entry.deleteMany({
        where: {
            ownerId: ownerId,
            key: key
        }
    })
    reply.code(200).send()
})

server.listen(Number(process.env['PORT']), (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})