# grunt-spritesheet

Generate a CSS sprite sheet out of individual PNGs with support for multiple sprites per CSS file. Any png with an `@2x` suffix is dropped into an alternate retina display sprite and handled accordingly in the CSS template.


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
    generate: {
      // An array of filename / source images array pairs. The basename of the sprite file
      // is also prefixed to the CSS classes.
      sprites: {
        "filename.png": ['/images/**/*.png'],
        ...
      },
      // The destination for the build stylesheet
      sheet: "stylesheet.css",
      // A mustache template used to render your sprites in a css file. (Optional)
      templateUrl: "path/to/template.mustache"
    }
  }
})
```

### Mustache Templates

Templates are parsed using mustache. If no template url is given, the default template is rendered.

Templates are given two lists: `std` and `dbl` representing standard and pixel doubled (retina) graphics. Each item contains:

- `sprite`
Spritesheet url

- `spriteWidth`
Width of the spritesheet as a whole

- `spriteHeight`
Height of the spritesheet as a whole

- `name`
Name of the sprite

- `width` 
Width of the sprite

- `height`
Height of the sprite

- `x`
X coordinates of the sprite in the spritesheet

- `y`
Y coordinates of the sprite in the spritesheet



```
{{#std}}
.{{&name}} {
  background-image: url({{&sprite}});
  width: {{width}}px;
  height: {{height}}px;
  background-position: -{{x}}px -{{y}}px;
}
{{/std}}

@media
only screen and (-webkit-min-device-pixel-ratio: 2),
only screen and (   -moz-min-device-pixel-ratio: 2),
only screen and (   min--moz-device-pixel-ratio: 2),
only screen and (   -ms-min-device-pixel-ratio: 2),
only screen and (     -o-min-device-pixel-ratio: 2/1),
only screen and (        min-device-pixel-ratio: 2),
only screen and (                min-resolution: 192dpi),
only screen and (                min-resolution: 2dppx) { 
  {{#dbl}}
  .{{&name}} {
    background-image: url({{&sprite}});
    width: {{width}}px;
    height: {{height}}px;
    background-position: -{{x}}px -{{y}}px;
    background-size: {{spriteWidth}}px {{spriteHeight}}px;
  }
  {{/dbl}}
}
```



## Contributing
A few ideas for future development:

- General code cleanup.
- Unit tests.
- Big time CSS optimization.
- Base64 sprite embedding in stylesheet
- Custom prefixes rather than using filenames. 
- Option to build output CSS with grunt-contrib-cssmin. 

