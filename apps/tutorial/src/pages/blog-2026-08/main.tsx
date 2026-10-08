import { createRoot } from 'react-dom/client'
import { BlogDatePage } from '../../components/BlogPages'

createRoot(document.getElementById('root')!).render(<BlogDatePage dateKey="2026-08" />)
