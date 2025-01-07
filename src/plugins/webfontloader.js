export function loadFonts() {
  const WebFont = require('webfontloader')

  WebFont.load({
    google: {
      families: ['Roboto:400,500,700', 'Material Icons']
    }
  })
}
