import { mount } from '../../mount'
import { App } from './App'

const page = <App />

export default page

if (typeof document !== 'undefined') mount(page)
