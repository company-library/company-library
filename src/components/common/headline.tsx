import React, { type FC } from 'react'

type HeadlineProps = {
  text: string
}

const Headline: FC<HeadlineProps> = ({ text }) => {
  return (
    <div className="my-3">
      <p className="text-3xl">{text}</p>
    </div>
  )
}

export default Headline
