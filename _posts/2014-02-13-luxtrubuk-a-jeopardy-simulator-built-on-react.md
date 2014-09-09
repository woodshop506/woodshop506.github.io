---
published: true
title: "LUXTRUBUK: a JEOPARDY!™ simulator built on React"
layout: post
---

## WHAT ARE WE YELLING ABOUT?!?!
My friends and I like JEOPARDY!™. So we found old episodes on YouTube and "played" along, yelling out answers before the contestants and writing down our scores on paper. It was fun, but finding new episodes would become a chore. And as it turns out, the actual contestants were much better than us and we missed a lot of questions. So when I needed a small project to try out Facebook's [React][0], a JEOPARDY!™ game seemed like the perfect fit.

And like that, [LUXTRUBUK][] was born.

## Architecture

My goal with LUXTRUBUK was to put as much of the functionality in the frontend as possible. I ended up with a backend that has one purpose: selecting a random gamehash from an array and returning it to the client. I could have put that array into the frontend but I wanted to spare the client another ~144kB.

*Sidenote: someone should start an AaaS (Arrays as a Service). Major perk is that you get to say "ass" with a funny intonation.*

The data for each game is stored in a json file, [like this one][4].

The frontend is basically just React with help from [Zepto][] and [Lo-Dash][]. I rolled up a [stupidly-simple router][60], but I might replace that with [Director][] at some point. I elected to go CommonJS-style modules for my code and used [Browserify][] to package them up for the browser. I find this strategy simpler and cleaner than AMD and Require.js.

For a build task runner, I elected to try out [gulp][] this time instead of my usual [Grunt][]. Run the develop task and we have watching compilation of CoffeeScript, JSX, Sass, and Browserify, as well as running Mocha tests. When it's time to build, gulp will compile, concatenate, and minify everything into a `dist/` directory.

For easy deployments to S3/CloudFront I'm using the ruby gem [s3_website][]. Supply a [configuration file][70] and run two s3_website commands to get set up, then it's just `s3_website push --site dist` to deploy.

But the real star of the show here is React.

## React is a great view layer
React components are modules of code that render markup based on properties and state. They are structured so that the flow of data is always down - components can include other components and set their props, but the child components have no reference to their parents.

For my money, the killer feature of React is its virtual DOM. When a component's `render()` function is called, it updates its virtual DOM and then does a diff with the actual DOM to apply any changes. You can call `render()` on your top-level component and if nothing has changed (state or props), React won't even touch the DOM. Since the DOM is usually a bottleneck, this is a big performance win.

I'm somewhat torn on JSX. It allows you to write HTML-like code which gets transpiled to native javascript calls to `React.DOM`. I [used it extensively][8] for the project, but I'm just not a fan of XML-style markup. Since I like CoffeeScript, I'd follow the lead of [vjeux][30] and [Evan Martin][20] for a cleaner syntax on my next React project. And there will be a next React project if I can help it.

## Prefer gulp to Grunt
I'm planning on writing an article on gulp so I'll only touch on it here. **TL;DR** gulp is the clear winner for a build system over Grunt.

Its use of Node streams and code instead of config is a natural match for this kind of project. [LUXTRUBUK's gulpfile][40] is probably half the size of a corresponding Gruntfile, and it's more readable. Tasks happen lightning fast, sometimes in the *sub-millisecond* range. For more info on gulp and its advantages, check out [this slide deck][50].

## Lesson learned: web development OSS is awesome
Could I have done LUXTRUBUK in spaghetti jQuery without React, Bower, gulp, Lo-Dash, etc? Sure, but it would have probably taken longer and been very fragile to change.

Lately there have been a few posts decrying the sheer number of new tools and frameworks that keep popping up, making the authors feel compelled to try everything lest they fall behind. While I respect that sentiment and don't think they were advocating jQuery pasta, I feel that we're very fortunate to be in a position to complain about the number of tools available to us.


[LUXTRUBUK]: http://luxtrubuk.jjt.io
[Zepto]: http://zeptojs.com
[Lo-Dash]: http://lodash.com
[Director]: https://github.com/flatiron/director
[gulp]: http://gulpjs.com
[Grunt]: http://gruntjs.com
[s3_website]: https://github.com/laurilehmijoki/s3_website
[Browserify]: http://browserify.org/
[70]: https://github.com/laurilehmijoki/s3_website/blob/master/additional-docs/example-configurations.md
[0]: http://facebook.github.io/react/index.html
[4]: http://luxtrubuk.jjt.io/data/games/efb4210a3e3edad92c46422bbe355daf.json
[10]: http://facebook.github.io/react/docs/jsx-in-depth.html
[8]: https://github.com/jjt/LUXTRUBUK/tree/master/client/src/jsx
[20]: http://neugierig.org/software/blog/2014/02/react-jsx-coffeescript.html
[30]: http://blog.vjeux.com/2013/javascript/react-coffeescript.html
[40]: https://github.com/jjt/LUXTRUBUK/blob/master/gulpfile.js
[50]: http://slid.es/contra/gulp
[60]: https://github.com/jjt/LUXTRUBUK/blob/master/client/src/jsx/index.jsx#L10-L69