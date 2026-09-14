"use client"

import * as React from "react"
import Image, { type ImageProps } from "next/image"

/**
 * SmartImage wraps next/image with a blur-up placeholder.
 * Shows a blurred gradient backdrop until the image loads, then fades it out.
 */
export function SmartImage({
  alt,
  className,
  wrapperClassName,
  ...props
}: ImageProps & { wrapperClassName?: string }) {
  const [loaded, setLoaded] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  // Handle images that are already complete (from cache) before onLoad fires
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
