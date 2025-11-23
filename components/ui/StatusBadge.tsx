import styled from 'styled-components'

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'verified' | 'unverified' | 'error'
  children: React.ReactNode
  className?: string
}

const StyledBadge = styled.span<{ status: StatusBadgeProps['status'] }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status }) => {
    switch (status) {
      case 'active':
      case 'verified':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'inactive':
      case 'unverified':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'pending':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'error':
        return `
          background: #fecaca;
          color: #dc2626;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`

export default function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <StyledBadge status={status} className={className}>
      {children}
    </StyledBadge>
  )
}