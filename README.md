# Allcolors chrome extension

Created a chrome extension based on [bgrins allcolors.js](https://github.com/bgrins/devtools-snippets/blob/master/snippets/allcolors/allcolors.js)

Used this as a opportunity to learn how to make a chrome extension.

This article on [bitsofcode](https://bitsofco.de/making-alix-a-chrome-extension-for-linting-html/) also helped me get the basic idea

## Use

Click 'Apply' to execute the allcolors script.

'Clear' Clears the result and all settings (incl the local sotrage)

## Options

The option available in the extension. Options are saved in local storage, so you don't need to set them again.

### CSS Properties

Add CSS properties that the extension will check for colors.

### Colors

Colors added here will be ignored by the extension when checking CSS properties.

### Include zero width borders

If checked the result will include a color when it's used on a border with a width of 0

### Log result to console

If checked the extension will log a more detailed result to the console. The result will contain all the elements grouped under the colors that they use.