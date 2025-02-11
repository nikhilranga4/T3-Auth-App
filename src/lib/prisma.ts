import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.SUPABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error']
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClientSingleton | undefined 
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Optional: Add a function to handle database connections
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to the database')
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    throw error
  }
}

// Optional: Add a function to disconnect
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('Disconnected from the database')
  } catch (error) {
    console.error('Error disconnecting from the database:', error)
  }
}
