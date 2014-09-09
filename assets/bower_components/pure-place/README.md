Pure-Place
====

A fork of the [Pure](http://purecss.io/) project that turns the `.pure____` classes in `src/**/css/*.css` into
`%pure____` placeholders in `scss/**/_*.scss`. Uses a custom [Grunt](http://gruntjs.com/)
task and some [Rework](https://github.com/visionmedia/rework).

### Install
    bower install pure-place

### Sass Placeholders

Almost all of the `.pure*` classes that make up the css are replaced by a placeholder so that you can
extend only those classes you need.

    // Pure css input
    .pure-table-bordered tbody > tr:last-child td,
    .pure-table-horizontal tbody > tr:last-child td {
        border-bottom-width: 0;
    }
    
    // Pure-place output
    %pure-table-bordered tbody > tr:last-child td,
    %pure-table-horizontal tbody > tr:last-child td {
      border-bottom-width: 0;
    }
    
    // Your scss
    .my-table {
      @extend %pure-table;
      @extend %pure-table-horizontal;
    }

The exception is the responsive grid system. It's recommended that you output the grid system css and
extend the `.pure-u/g/r-*` classes. For more information, see
[Responsive Grid System Issues](#responsive-grid-system-issues).

### Pure classes

Pure place also offers stylesheets that output the Pure classes in css, with a customizable
prefix, `$pure-classes-prefix`.

### Example

`my-styles.scss`

    // Placeholders
    @import "pure-place/scss/pure-placeholders";
    
    // This outputs the css for the grid system so you can use .pure-g/u/r
    // classes in your HTML rather than only extending %pure-g/u/r on selectors
    // If you're only importing the placeholders, this is recommended
    // Set $pure-grid-u-prefixes and $pure-grid-g-prefixes for .custom-g/u/r 
    @import "pure-place/scss/grid-classes";
    
    // This is the same output as the base Pure library, but with the option to 
    // change the class prefix of "pure" by setting $pure-classes-prefix
    //
    // @import "pure-place/scss/pure-classes";
    
    
    .container {
      @extend %pure-g; 
    }
    
    .another-container {
      @extend %pure-g;
    }
    
    .section {
      @extend %pure-u-1;
    }
    
    .main {
      @extend %pure-u-2-3;
    }
    
    .sidebar {
      @extend %pure-u-1-3;
    }
    
    .my-table {
      @extend %pure-table;
      @extend %pure-table-bordered;
      tbody tr:nth-child(2n) {
        @extend %pure-table-odd;
      }
    }

### Responsive Grid System Issues

Pure uses the `[class *= "_____"]` selector in the following way: 

    @media (max-width: 767px) {
        .pure-g-r > .pure-u,
        .pure-g-r > [class *= "pure-u-"] {
            width: 100%;
        }

Since `pure-u` is a hard-coded classname, we have to output a definitive classname at compile time and 
placeholders won't target those. So we make these media blocks out of  combinations of the
variables/lists `$pure-g-r-prefixes` and `$pure-u-r-prefixes`.

Those variables accept multiple prefixes, but you end up with `n*m` repeated selector names and media blocks.
In most cases, one prefix each (default `pure-r` and `pure-u`) is sufficient as you can always
`@extend` your structural elements with the specific `%pure-g[-r]` and `%pure-u-____` placeholders/classes.

### Changelog

#### v0.2.0
 * Sync tags/version with Pure
 * Published on Bower

#### v0.1.1
 * Responsive media queries  
 * Grid selector functions



    
