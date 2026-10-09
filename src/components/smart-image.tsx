"use client"

import * as React from "react"
import Image, { type ImageProps } from "next/image"

export function SmartImage({
  alt,
  className,
  wrapperClassName,
  ...props
}: ImageProps & { wrapperClassName?: string }) {
  const [loaded, setLoaded] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  return (
    <span
      className={`relative block overflow-hidden ${
        loaded ? "img-loaded" : ""
      } ${wrapperClassName ?? ""}`}
    >
      <span className="img-blur-placeholder" aria-hidden="true" />
      <Image
        {...props}
        alt={alt}
        className={className}
        ref={imgRef}
        onLoad={() => setLoaded(true)}
      />
    </span>
  )
}
