import path from 'path'

export const FONT_PATHS = {
  helvetica: {
    normal: path.join(process.cwd(), 'public/fonts/Helvetica.ttf'),
    bold: path.join(process.cwd(), 'public/fonts/Helvetica-Bold.ttf'),
    italic: path.join(process.cwd(), 'public/fonts/Helvetica-Oblique.ttf'),
    boldItalic: path.join(process.cwd(), 'public/fonts/Helvetica-BoldOblique.ttf')
  }
} 