import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none ${className}`}
      {...props}
    />
  )
}