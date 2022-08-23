import path from 'path'

export const SCREENSHOTS_FOLDER = 'screenshots'

export const screenshotPath = (name: string) => path.join(__dirname, SCREENSHOTS_FOLDER, `${name}.png`)
