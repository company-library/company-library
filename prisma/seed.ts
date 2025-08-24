import { PrismaClient } from '@/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "return_histories" RESTART IDENTITY CASCADE;`)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "lending_histories" RESTART IDENTITY CASCADE;`)
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "registration_histories" RESTART IDENTITY CASCADE;`,
  )
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "impressions" RESTART IDENTITY CASCADE;`)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "reservations" RESTART IDENTITY CASCADE;`)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "books" RESTART IDENTITY CASCADE;`)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "locations" RESTART IDENTITY CASCADE;`)

  // 保管場所データを作成
  const location1 = await prisma.location.create({
    data: {
      name: '1階 エントランス',
      order: 1,
    },
  })
  const location2 = await prisma.location.create({
    data: {
      name: '2階 開発室',
      order: 2,
    },
  })
  const location3 = await prisma.location.create({
    data: {
      name: '3階 会議室',
      order: 3,
    },
  })

  const alice = await prisma.user.create({
    data: {
      email: 'alice@company.com',
      name: 'アリス',
      imageUrl: 'https://picsum.photos/id/237/200',
    },
  })
  const bob = await prisma.user.create({
    data: {
      email: 'bob@company.com',
      name: 'ボブ',
    },
  })

  const book1 = await prisma.book.create({
    data: {
      title: 'JavaScript 完全ガイド',
      isbn: '1111111111111',
    },
  })
  const book2 = await prisma.book.create({
    data: {
      title: 'TypeScript ハンドブック',
      isbn: '2222222222222',
    },
  })
  const book3 = await prisma.book.create({
    data: {
      title: 'React開発入門',
      isbn: '3333333333333',
    },
  })
  const book4 = await prisma.book.create({
    data: {
      title: 'データベース設計の基礎',
      isbn: '4444444444444',
    },
  })

  // book1 (JavaScript完全ガイド) - 3冊、複数場所に配置
  await prisma.registrationHistory.create({
    data: {
      bookId: book1.id,
      userId: alice.id,
      locationId: location1.id, // 1階 エントランス
    },
  })
  await prisma.registrationHistory.create({
    data: {
      bookId: book1.id,
      userId: bob.id,
      locationId: location2.id, // 2階 開発室
    },
  })
  await prisma.registrationHistory.create({
    data: {
      bookId: book1.id,
      userId: alice.id,
      locationId: location2.id, // 2階 開発室
    },
  })

  // book2 (TypeScript ハンドブック) - 2冊、開発室とエントランス
  await prisma.registrationHistory.create({
    data: {
      bookId: book2.id,
      userId: alice.id,
      locationId: location1.id, // 1階 エントランス
    },
  })
  await prisma.registrationHistory.create({
    data: {
      bookId: book2.id,
      userId: bob.id,
      locationId: location2.id, // 2階 開発室
    },
  })

  // book3 (React開発入門) - 1冊、会議室
  await prisma.registrationHistory.create({
    data: {
      bookId: book3.id,
      userId: alice.id,
      locationId: location3.id, // 3階 会議室
    },
  })

  // book4 (データベース設計の基礎) - 3冊、既存の場所に配置
  await prisma.registrationHistory.create({
    data: {
      bookId: book4.id,
      userId: bob.id,
      locationId: location1.id, // 1階 エントランス
    },
  })
  await prisma.registrationHistory.create({
    data: {
      bookId: book4.id,
      userId: alice.id,
      locationId: location2.id, // 2階 開発室
    },
  })
  await prisma.registrationHistory.create({
    data: {
      bookId: book4.id,
      userId: alice.id,
      locationId: location3.id, // 3階 会議室
    },
  })

  // 貸出履歴の作成（返却済み）
  const pastLendingHistory1 = await prisma.lendingHistory.create({
    data: {
      bookId: book1.id,
      userId: alice.id,
      locationId: location1.id, // 1階エントランスから借りた
      lentAt: new Date('2024-01-10'),
      dueDate: new Date('2024-01-24'),
    },
  })

  // 現在貸出中（book1の開発室の本をBobが借りている）
  await prisma.lendingHistory.create({
    data: {
      bookId: book1.id,
      userId: bob.id,
      locationId: location2.id, // 2階開発室から借りた
      lentAt: new Date('2024-01-15'),
      dueDate: new Date('2024-01-29'),
    },
  })

  // 現在貸出中（book2をAliceが借りている）
  await prisma.lendingHistory.create({
    data: {
      bookId: book2.id,
      userId: alice.id,
      locationId: location1.id, // 1階エントランスから借りた
      lentAt: new Date('2024-01-20'),
      dueDate: new Date('2024-02-03'),
    },
  })

  // 現在貸出中（book4をBobが借りている）
  await prisma.lendingHistory.create({
    data: {
      bookId: book4.id,
      userId: bob.id,
      locationId: location1.id, // 1階 エントランスから借りた
      lentAt: new Date('2024-01-18'),
      dueDate: new Date('2024-02-01'),
    },
  })

  // 返却済み（book3を借りて返却）
  const pastLendingHistory2 = await prisma.lendingHistory.create({
    data: {
      bookId: book3.id,
      userId: bob.id,
      locationId: location3.id, // 3階会議室から借りた
      lentAt: new Date('2024-01-05'),
      dueDate: new Date('2024-01-19'),
    },
  })

  // 返却履歴の作成
  await prisma.returnHistory.create({
    data: {
      lendingHistoryId: pastLendingHistory1.id,
      returnedAt: new Date('2024-01-22'),
    },
  })

  await prisma.returnHistory.create({
    data: {
      lendingHistoryId: pastLendingHistory2.id,
      returnedAt: new Date('2024-01-18'),
    },
  })

  // 感想の追加
  await prisma.impression.create({
    data: {
      bookId: book1.id,
      userId: alice.id,
      impression:
        'JavaScriptの基礎から応用まで詳しく説明されており、とても参考になりました。実際のプロジェクトで活用できる内容が多くありました。',
    },
  })

  await prisma.impression.create({
    data: {
      bookId: book3.id,
      userId: bob.id,
      impression:
        'Reactの概念が分かりやすく解説されていて、実践的な内容でした。コンポーネント設計の参考になります。',
    },
  })

  await prisma.impression.create({
    data: {
      bookId: book2.id,
      userId: bob.id,
      impression:
        'TypeScriptの型システムについて理解が深まりました。特にジェネリクスの章が秀逸でした。',
    },
  })

  // 予約の追加
  await prisma.reservation.create({
    data: {
      bookId: book1.id,
      userId: alice.id,
      reservationDate: new Date('2024-01-25'),
    },
  })

  await prisma.reservation.create({
    data: {
      bookId: book3.id,
      userId: bob.id,
      reservationDate: new Date('2024-01-26'),
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
