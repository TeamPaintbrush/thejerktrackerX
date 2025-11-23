import styled from 'styled-components'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'selected' | 'inactive'
  padding?: string
}

const StyledCard = styled.div<{ variant: CardProps['variant']; padding?: string }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  padding: ${({ padding }) => padding || '20px'};
  
  ${({ variant }) => {
    switch (variant) {
      case 'selected':
        return `
          border: 2px solid #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        `;
      case 'inactive':
        return `
          opacity: 0.6;
          border: 1px solid #e5e7eb;
        `;
      default:
        return `
          border: 1px solid #e5e7eb;
          
          &:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transform: translateY(-1px);
          }
        `;
    }
  }}
`

const CardHeader = styled.div`
  margin-bottom: 16px;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
  
  p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
  }
`

const CardContent = styled.div`
  color: #374151;
`

const CardFooter = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`

// Main Card component
export default function Card({ children, className, variant = 'default', padding }: CardProps) {
  return (
    <StyledCard variant={variant} padding={padding} className={className}>
      {children}
    </StyledCard>
  )
}

// Export sub-components
export { CardHeader, CardContent, CardFooter }