import { mount } from '@stack/site-kit/mount'
import { App } from './App'

const page = <App />

export default page

if (typeof document !== 'undefined') mount(page)
