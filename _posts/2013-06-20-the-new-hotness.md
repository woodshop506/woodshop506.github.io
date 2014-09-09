---
layout: post
published: true 
title: The New Hotness
splash: ""
---

## JJT.IO: New Domain, New Blog Design
 
Jay jay tee dot eye oh. Hmmm, nice. So svelte compared to jasontrill.com. Only
fitting that the rest of the site slims down to match the name.
 
## Sniglet might be the best and most appropriately named font
My old Jekyll blog served out of jasontrill.com was created using 
Jekyll-Bootstrap. It's great for getting up and running quickly, but Bootstrap
is just completely unnecessary for my simple 1-column blog. So instead I'm using 
a vanilla install of Jekyll, part of YUI Pure's grid system,
and a chubby little font by the name of [Sniglet](http://www.google.com/fonts/specimen/Sniglet)
to do the logo. I thoroughly enjoy its plump little letters.
 
## YUI Pure is a great little (!) framework
It offers normalize.css and a responsive grid system, forms, buttons, tables and menus all in 4.2k min+gzip! Being that I'm a Sass guy and [Pure](http://purecss.io) is a CSS-only library, I went ahead and made a fork of it called Pure Place that produces [Sass placeholders](http://ianstormtaylor.com/oocss-plus-sass-is-the-best-way-to-css/)
so you can `@extend` only the pure classes you need.
 
The fork can also output the pure css classes with customizable
prefixes (if `.pure-______` isn't to your liking). It's available on Bower under `pure-place` and on
[Github](https://github.com/jjt/pure-place). 
 
## I adopted the Solarized colours because they're simply radsauce
And if I'm going to whip out the colour selector to yank the colours off the [Solarized site](http://ethanschoonover.com/solarized "The New Hotness"), I figured  I might as well make a Bower component out of them called `solarized` to save others the trouble. It offers Sass variables for the colours and Sass placeholders and (optionally) classes for both
background and foreground colors. Check it out on
[the 'thub](https://github.com/jjt/bower-solarized).
