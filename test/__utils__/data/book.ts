export const bookWithImage = {
  id: 1,
  title: '画像有りのタイトル',
  imageUrl:
    'http://books.google.com/books/content?id=QlmenQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
}

export const bookWithoutImage = {
  id: 2,
  title: '画像無しのタイトル',
  imageUrl: '',
}

const now = new Date()

export const lendableBook = {
  ...bookWithImage,
  isbn: '1111111111111',
  registrationHistories: [
    { userId: 1, createdAt: now },
    { userId: 2, createdAt: now },
  ],
  lendingHistories: [],
  reservations: [{ userId: 1, reservationDate: now, createdAt: now }],
}
