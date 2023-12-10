'use client'

import { FC } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavigationBarItemProps = {
  label: string
  href: string
}

const NavigationBarItem: FC<NavigationBarItemProps> = ({ label, href }) => {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={`rounded-md my-auto px-3 py-2 ${
        pathname === href ? 'bg-gray-600' : 'text-gray-200 hover:text-white hover:bg-gray-500'
      } `}
    >
      {label}
    </Link>
  )
}

export default NavigationBarItem
