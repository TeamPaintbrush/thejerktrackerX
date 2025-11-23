import styled from 'styled-components'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const StyledButton = styled.button<{
  variant: ButtonProps['variant']
  size: ButtonProps['size']
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  text-decoration: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Size variations */
  ${({ size }) => {
    switch (size) {
      case 'small':
        return `
          padding: 8px 12px;
          font-size: 14px;
          gap: 6px;
        `;
      case 'large':
        return `
          padding: 12px 24px;
          font-size: 16px;
          gap: 10px;
        `;
      default: // medium
        return `
          padding: 10px 16px;
          font-size: 15px;
          gap: 8px;
        `;
    }
  }}
  
  /* Color variations */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #3b82f6;
          color: white;
          
          &:hover:not(:disabled) {
            background: #2563eb;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: #6b7280;
          color: white;
          
          &:hover:not(:disabled) {
            background: #4b5563;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          
          &:hover:not(:disabled) {
            background: #3b82f6;
            color: white;
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: #dc2626;
          color: white;
          
          &:hover:not(:disabled) {
            background: #b91c1c;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          
          &:hover:not(:disabled) {
            background: #e5e7eb;
            transform: translateY(-1px);
          }
        `;
    }
  }}
`

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  className
}: ButtonProps) {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={className}
    >
      {children}
    </StyledButton>
  )
}