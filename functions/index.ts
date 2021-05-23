import { Entry, PrismaClient } from '@prisma/client'

export default {
    postValue: async function(prisma : PrismaClient, ownerId: string, key : string, value : any) : Promise<Entry> {
        let entry = await prisma.entry.findFirst({
            where: {
                ownerId: ownerId,
                key: key
            }
        })
        if (entry) {
            entry = await prisma.entry.update({
                where: { id: entry.id },
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
        return entry
    },
    patchValue: async function(prisma : PrismaClient, ownerId: string, key : string, value : any) : Promise<Entry> {
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
                where: { id: entry.id },
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
        return entry
    }
}