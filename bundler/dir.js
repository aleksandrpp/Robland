import { fileURLToPath } from 'url'
import { dirname, resolve as resolvePath } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export const resolve = path => resolvePath(__dirname, path)
