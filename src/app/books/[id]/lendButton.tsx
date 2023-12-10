'use client'

import React, { FC, Fragment, startTransition, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { DATE_SYSTEM_FORMAT } from '@/constants'
import { dateStringToDate, getDaysLater, toJstFormat } from '@/libs/luxon/utils'
import { lendBook } from '@/app/books/[id]/actions'

type LendButtonProps = {
  bookId: number
  userId: number
  disabled: boolean
}

const LendButton: FC<LendButtonProps> = ({ bookId, userId, disabled }) => {
  const [dueDate, setDueDate] = useState(getDaysLater(7))

  const [isOpen, setIsOpen] = useState(false)

  const closeModal = () => {
    setIsOpen(false)
  }

  const openModal = () => {
    setIsOpen(true)
  }

  const onClick = () => {
    startTransition(async () => {
      await lendBook(bookId, userId, dueDate)
      closeModal()
    })
  }

  return (
    <>
      <button
        className="bg-gray-400 hover:bg-gray-300 text-white rounded px-4 py-2 disabled:bg-gray-100"
        disabled={disabled}
        onClick={() => openModal()}
      >
        借りる
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    何日まで借りますか？
                  </Dialog.Title>

                  <div className="mt-2">
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={toJstFormat(dueDate, DATE_SYSTEM_FORMAT)}
                      onChange={(e) => setDueDate(dateStringToDate(e.target.value))}
                      min={toJstFormat(new Date(), DATE_SYSTEM_FORMAT)}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onClick}
                    >
                      Ok
                    </button>

                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default LendButton
