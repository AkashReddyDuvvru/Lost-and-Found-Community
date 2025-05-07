import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "small" | "medium" | "large"
  centered?: boolean
  linkWrapper?: boolean
  href?: string
}

export function Logo({
  className,
  showText = true,
  size = "medium",
  centered = false,
  linkWrapper = true,
  href = "/",
}: LogoProps) {
  // Adjusted sizes to maintain proper aspect ratio and prevent cutting
  const sizes = {
    small: { width: 40, height: 40 },
    medium: { width: 60, height: 60 },
    large: { width: 100, height: 100 },
  }

  const logoContent = (
    <>
      <div className="relative">
        <Image
          src="/images/srm-logo.png"
          alt="SRM Institute of Science and Technology"
          width={sizes[size].width}
          height={sizes[size].height}
          className="object-contain"
          priority
        />
      </div>
      {showText && !centered && <span className="ml-2 text-xl font-bold">Lost & Found</span>}
    </>
  )

  const wrapperClasses = `flex ${centered ? "flex-col items-center" : "items-center"} ${className || ""}`

  if (linkWrapper) {
    return (
      <div className={wrapperClasses}>
        <Link href={href} className={`flex ${centered ? "flex-col items-center" : "items-center"}`}>
          {logoContent}
        </Link>
        {showText && centered && <span className="mt-4 text-2xl font-bold">Lost & Found</span>}
      </div>
    )
  }

  return (
    <div className={wrapperClasses}>
      <div className={`flex ${centered ? "flex-col items-center" : "items-center"}`}>{logoContent}</div>
      {showText && centered && <span className="mt-4 text-2xl font-bold">Lost & Found</span>}
    </div>
  )
}
