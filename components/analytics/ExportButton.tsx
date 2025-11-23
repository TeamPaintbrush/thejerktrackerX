import React, { useState } from 'react'
import styled from 'styled-components'
import Button from '@/components/ui/Button'

interface ExportButtonProps {
  data: any[]
  filename?: string
  format?: 'csv' | 'json' | 'excel'
  onExport?: (format: string) => void
  disabled?: boolean
  className?: string
}

interface ExportDropdownProps {
  isOpen: boolean
  onSelect: (format: string) => void
  onClose: () => void
}

const ExportContainer = styled.div`
  position: relative;
  display: inline-block;
`

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 180px;
  z-index: 50;
  margin-top: 8px;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.15s ease;
  
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  &:hover {
    background: #f9fafb;
  }
  
  .format-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }
  
  .format-info {
    flex: 1;
    
    .format-name {
      font-weight: 500;
      color: #111827;
      margin-bottom: 2px;
    }
    
    .format-desc {
      font-size: 12px;
      color: #6b7280;
    }
  }
`

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`

const LoadingSpinner = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f3f4f6;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

function ExportDropdown({ isOpen, onSelect, onClose }: ExportDropdownProps) {
  const exportFormats = [
    {
      key: 'csv',
      icon: '📊',
      name: 'CSV File',
      description: 'Comma-separated values'
    },
    {
      key: 'json',
      icon: '📄',
      name: 'JSON File', 
      description: 'JavaScript Object Notation'
    },
    {
      key: 'excel',
      icon: '📈',
      name: 'Excel File',
      description: 'Microsoft Excel format'
    }
  ]

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <DropdownMenu isOpen={isOpen}>
        {exportFormats.map((format) => (
          <DropdownItem 
            key={format.key}
            onClick={() => onSelect(format.key)}
          >
            <span className="format-icon">{format.icon}</span>
            <div className="format-info">
              <div className="format-name">{format.name}</div>
              <div className="format-desc">{format.description}</div>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </>
  )
}

export default function ExportButton({
  data,
  filename = 'export',
  format = 'csv',
  onExport,
  disabled = false,
  className
}: ExportButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  const convertToJSON = (data: any[]) => {
    return JSON.stringify(data, null, 2)
  }

  const convertToExcel = (data: any[]) => {
    // For now, return CSV format (would need a library like SheetJS for true Excel format)
    return convertToCSV(data)
  }

  const handleExport = async (selectedFormat: string) => {
    setIsExporting(true)
    setIsDropdownOpen(false)
    
    try {
      if (onExport) {
        onExport(selectedFormat)
        return
      }

      let content: string
      let mimeType: string
      let fileExtension: string
      
      switch (selectedFormat) {
        case 'json':
          content = convertToJSON(data)
          mimeType = 'application/json'
          fileExtension = 'json'
          break
        case 'excel':
          content = convertToExcel(data)
          mimeType = 'application/vnd.ms-excel'
          fileExtension = 'csv' // Using CSV for now
          break
        default: // csv
          content = convertToCSV(data)
          mimeType = 'text/csv'
          fileExtension = 'csv'
      }
      
      const timestamp = new Date().toISOString().split('T')[0]
      const fileName = `${filename}_${timestamp}.${fileExtension}`
      
      downloadFile(content, fileName, mimeType)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSingleFormatExport = () => {
    handleExport(format)
  }

  // If only one format is supported, show a simple button
  if (format !== 'csv' || onExport) {
    return (
      <Button
        variant="outline"
        size="medium"
        onClick={handleSingleFormatExport}
        disabled={disabled || isExporting || data.length === 0}
        className={className}
      >
        {isExporting ? (
          <LoadingSpinner>
            <div className="spinner" />
            Exporting...
          </LoadingSpinner>
        ) : (
          <>
            📊 Export {format.toUpperCase()}
          </>
        )}
      </Button>
    )
  }

  // Show dropdown for multiple formats
  return (
    <ExportContainer className={className}>
      <Button
        variant="outline"
        size="medium"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled || isExporting || data.length === 0}
      >
        {isExporting ? (
          <LoadingSpinner>
            <div className="spinner" />
            Exporting...
          </LoadingSpinner>
        ) : (
          <>
            📊 Export Data
            <span style={{ marginLeft: '4px' }}>▼</span>
          </>
        )}
      </Button>
      
      <ExportDropdown
        isOpen={isDropdownOpen && !isExporting}
        onSelect={handleExport}
        onClose={() => setIsDropdownOpen(false)}
      />
    </ExportContainer>
  )
}