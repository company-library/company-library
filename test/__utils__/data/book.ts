import { location1, location2 } from './location'

export const bookWithImage = {
  id: 1,
  title: '画像有りのタイトル',
  description: '画像有りの書籍の概要',
  isbn: '1111111111111',
  imageUrl:
    'https://example.com/books/content?id=QlmenQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  createdAt: new Date('2023-07-22T06:12:23.527Z'),
}

export const bookWithoutImage = {
  id: 2,
  title: '画像無しのタイトル',
  description: '画像無しの書籍の概要',
  isbn: '2222222222222',
  imageUrl: '',
  createdAt: new Date('2023-07-22T06:12:24.118Z'),
}

const now = new Date()

export const lendableBook = {
  ...bookWithImage,
  isbn: '1111111111111',
  registrationHistories: [
    { userId: 1, createdAt: now, locationId: location1.id, location: location1 },
    { userId: 2, createdAt: now, locationId: location2.id, location: location2 },
  ],
  lendingHistories: [],
  reservations: [{ userId: 1, reservationDate: now, createdAt: now }],
}

export const book1 = bookWithImage

export const book2 = {
  ...bookWithImage,
  id: 2,
}

export const book3 = {
  ...bookWithImage,
  id: 3,
}

export const book4 = {
  ...bookWithImage,
  id: 4,
}

export const book5 = {
  ...bookWithImage,
  id: 5,
}

export const book6 = {
  ...bookWithImage,
  id: 6,
}
