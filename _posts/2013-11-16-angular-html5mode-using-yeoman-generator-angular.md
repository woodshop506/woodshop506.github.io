---
published: true
title: "Angular html5Mode support for Yeoman & generator-angular"
layout: post
---


## Smash the hash: Angular's html5mode and pushState

In my previous article about [using generator-angular to develop Angular applications][1000], we left Angular with its default setting of using hashes for urls, for example `http://127.0.0.1:9000/#/foo`.
This is the way that Angular ships by default and it's completely fine, but for us pickier devs there's the [html5Mode][7] setting which uses [pushState][] with a fallback shim for [unsupported browsers][1001]. There are a few things we need to do in order to enable Yeoman & generator-angular to work in this way.


First off is setting html5Mode in our app so that Angular knows we want to use pushState instead of hashes. Open up `app.js`, add the `$locationProvider` service to the `config` function, and tell Angular to use html5Mode:

    .config(function ($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      //...
    })

Easy, right? Now if we visit our app and click on a link to `/foo` for example,
it should change to the 'foo' view just as it did with the hash before but now our url will be `http://127.0.0.1:9000/foo`.
Everything will work great when clicking around in our app, but once we start making
changes to our app, livereload will refresh the browser and it will 404. Huh?

## The development server has a very tight focus

That's happening because our connect development server doesn't know how to serve anything other than `/` and static files. So it sees `/foo` and looks for that file, which doesn't exist. If you've done any ops work using Apache or Nginx, (mod_)rewrite should spring to mind as the solution. We'll be using the connect middleware `connect-modrewrite` for this job.

First we'll install it, saving it to our package.json:

    $ npm install --save-dev connect-modrewrite

And then we'll add the following snippet to our Gruntfile in the
`connect.options` object which should be around line 60, in the large `grunt.initConfig` function call. This middleware rewrites any request that isn't for a valid static file to `index.html`.

    connect: {
      options: {
        // ...
        // Modrewrite rule, connect.static(path) for each path in target's base
        middleware: function (connect, options) {
          var optBase = (typeof options.base === 'string') ? [options.base] : options.base;
          return [require('connect-modrewrite')(['!(\\..+)$ / [L]'])].concat(
            optBase.map(function(path){ return connect.static(path); }));
        }
      }
    }

Alright, now we reload our browser at `http://127.0.0.1:9000/foo` and it loads
(hurray!), but our Angular app isn't initializing and the page is unstyled (boo). If we
pop open our browser's network inspector we'll see a bunch of 404s. This is due to...

## Relative vs root-relative paths
Because generator-angular assumes that we'll be using the hash mode, it
generates *relative* static asset paths like:

    <script src="scripts/app.js"></script>

So when we're at `http://127.0.0.1:9000/foo`, the browser is looking for `/foo/scripts/app.js`, which obviously doesn't exist. There are a couple of ways to solve this, one being to use root-relative paths. I've been a fan of them for years when absolute urls aren't convenient, so this is the solution I recommend.

Since there's no option yet to tell generator-angular to use root-relative paths, my low-tech solution is to go into `index.html` and turn every script and link tag into root-relative ones:

    <script src="/scripts/app.js"></script>

This is less automated than I'd like, but it works just fine. There is [some discussion][9] on the generator-angular issue
tracker about adding html5mode support, or at least adding the option of a
prefix on the script/link tags (either just a slash for root-relative, or a full
absolute base url).

Another option to the relative urls is to set the base url of the site by
putting `<base href="/">` in the head, but that's not without [its
problems][8].

## Caveat Angtor

Note that enabling html5mode support also requires us to have a production
server that can do the rewriting. One of the advantages of Angular is that
we can ordinarily do a static deploy to S3 or the like, reducing
ops work and server cost. So it's up to you to decide whether or not
html5mode is worth it.

[1000]: /2013/11/14/easy-angular-development-yeoman-generator-angular/
[1001]: http://caniuse.com/#feat=history
[pushState]: https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history
[7]: http://docs.angularjs.org/guide/dev_guide.services.$location#general-overview-of-the-api_$location-service-configuration
[8]: http://stackoverflow.com/questions/1889076/is-it-recommended-to-use-the-base-html-tag
[9]: https://github.com/yeoman/generator-angular/issues/433
