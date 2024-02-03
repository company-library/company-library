import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.returnHistory.deleteMany({})
  await prisma.lendingHistory.deleteMany({})
  await prisma.registrationHistory.deleteMany({})
  await prisma.impression.deleteMany({})
  await prisma.reservation.deleteMany({})
  await prisma.book.deleteMany({})
  await prisma.user.deleteMany({})

  const alice = await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
      imageUrl: 'https://picsum.photos/id/237/200',
    },
  })
  const bob = await prisma.user.create({
    data: {
      email: 'bob@prisma.io',
      name: 'Bob',
    },
  })

  const book1 = await prisma.book.create({
    data: {
      title: '画像有りのタイトル',
      isbn: '1111111111111',
      imageUrl:
        'https://books.google.com/books/content?id=fyvwzgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    },
  })
  const book2 = await prisma.book.create({
    data: {
      title: '画像無しのタイトル',
      isbn: '2222222222222',
    },
  })

  await prisma.registrationHistory.create({
    data: {
      bookId: book1.id,
      userId: alice.id,
    },
  })
  await prisma.registrationHistory.create({
    data: {
      bookId: book1.id,
      userId: bob.id,
    },
  })
  await prisma.registrationHistory.create({
    data: {
      bookId: book2.id,
      userId: alice.id,
    },
  })

  const lendingHistory = await prisma.lendingHistory.create({
    data: {
      bookId: book1.id,
      userId: alice.id,
      lentAt: new Date(),
      dueDate: new Date(),
    },
  })

  await prisma.lendingHistory.create({
    data: {
      bookId: book2.id,
      userId: alice.id,
      lentAt: new Date(),
      dueDate: new Date(),
    },
  })

  await prisma.returnHistory.create({
    data: {
      lendingHistoryId: lendingHistory.id,
      returnedAt: new Date(),
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
