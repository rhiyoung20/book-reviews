import React from 'react'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = 'Avatar', ...props }) => {
  return (
    <img
      src={src || '/default-avatar.png'} // 기본 아바타 이미지 경로
      alt={alt}
      className="rounded-full"
      {...props}
    />
  )
}