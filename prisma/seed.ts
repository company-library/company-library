import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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

  const book1RegistrationHistory1 = await prisma.registrationHistory.create({
    data: {
      bookId: book1.id,
      userId: alice.id,
    },
  })
  const book1RegistrationHistory2 = await prisma.registrationHistory.create({
    data: {
      bookId: book1.id,
      userId: bob.id,
    },
  })
  const book2RegistrationHistory = await prisma.registrationHistory.create({
    data: {
      bookId: book2.id,
      userId: alice.id,
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
