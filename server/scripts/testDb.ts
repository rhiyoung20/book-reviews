import prisma from '../lib/prisma'

async function main() {
  try {
    await prisma.$connect()
    console.log('데이터베이스 연결 성공!')
    
    // 간단한 쿼리 테스트
    const userCount = await prisma.user.count()
    console.log('현재 사용자 수:', userCount)
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()