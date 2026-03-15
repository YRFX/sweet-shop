import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import fs from 'fs-extra'
import path from 'path'
// https://vitejs.dev/config/

function copyCloudFunctions() {
  return {
    enforce: 'post',
    async writeBundle() {
      const targetDir = path.join(
        __dirname,'dist',process.env.NODE_ENV ==='production'?'build':'dev',
        process.env.UNI_PLATFORM,
        'cloudfunctions'
      )
      await fs.copy(path.resolve(__dirname,'src/cloudfunctions'),targetDir)
    }
  }
}
export default defineConfig({
  plugins: [
    uni(),
    copyCloudFunctions()
  ],
})
