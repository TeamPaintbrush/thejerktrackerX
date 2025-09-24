'use client';

import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../styles/components';
import { theme } from '../styles/theme';
import { ToastProvider } from '../components/Toast';
import { AnimatePresence } from 'framer-motion';
import StyledComponentsRegistry from '../lib/registry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider theme={theme}>
            <GlobalStyles />
            <ToastProvider>
              <AnimatePresence mode="wait" initial={false}>
                {children}
              </AnimatePresence>
            </ToastProvider>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}