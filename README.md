# grunt-spritesheet

Generate a CSS sprite sheet out of individual PNGs with support for multiple sprites per CSS file. Any png with an `@2x` suffix is dropped into an alternate retina display sprite and handled accordingly in the CSS.


## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-spritesheet --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-spritesheet');
```

## The "spritesheet" task

### Overview
In your project's Gruntfile, add a section named `spritesheet` to the data object passed into `grunt.initConfig()`. 

```js
grunt.initConfig({
  spritesheet: {
    // An array of filename / source images array pairs. The basename of the sprite file
    // is also prefixed to the CSS classes.
    sprites: {
      "filename.png": ['/images/**/*.png'],
      ...
    },
    // The destination for the build stylesheet
    sheet: "stylesheet.css"
  }
})
```

## Contributing
A few ideas for future development:

- General code cleanup.
- Unit tests.
- Big time CSS optimization.
- Custom prefixes rather than using filenames. 
- Custom templates.
- Automatic state (hover, active) for <a> and <button> tags generation based on sprite name or using an alternate Gruntfile syntax.
- Option to build output CSS with grunt-contrib-cssmin. 

