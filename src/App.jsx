import { useState } from 'react'
import { WealthProvider } from './context/WealthContext';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <WealthProvider>
      <AppShell />
    </WealthProvider>
  )
}

export default App
