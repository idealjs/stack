import { createRoot } from 'react-dom/client'
import { BlogPostPage } from '../../components/BlogPages'

createRoot(document.getElementById('root')!).render(<BlogPostPage slug="gorzil" />)
