import { prisma } from "./prisma"

export { prisma }

// Database connection test
export async function testConnection() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect()
}

// Health check
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: "healthy", timestamp: new Date().toISOString() }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}
