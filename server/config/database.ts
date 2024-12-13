import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    
    // 데이터베이스 정보 출력
    const databaseUrl = process.env.DATABASE_URL || '';
    const dbInfo = {
      database: databaseUrl.split('/').pop()?.split('?')[0],
      host: databaseUrl.split('@')[1]?.split(':')[0],
      user: databaseUrl.split('://')[1]?.split(':')[0]
    };
    
    console.log('데이터베이스 연결 성공:', dbInfo);
    
    // 테이블 정보 확인
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('사용 가능한 테이블:', tables);
    
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    process.exit(1);
  }
}

connectDatabase();

export default prisma;