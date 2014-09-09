---
published: true
title: "Easy Angular development with Yeoman & generator-angular"
layout: post
---

One of the best things to happen in web development over the past few years has
been the variety of tools built on [Node.js][1001] and made available through
its package manager, [npm][1000]. Among the 75,000 or so modules, there are
three that I use almost every hour of every working day: [Grunt][0], a
versatile task runner; [Bower][1], a frontend asset package manager; and
[Yeoman][2], a generator framework that automates repetitive scaffolding and
dev/deploy tasks, using Grunt and Bower.

This article will focus on using Yeoman and [generator-angular][3] to set up a
great environment for developing Angular applications in a modular, testable fashion. With only a handful of terminal
commands, we'll have the following features:

- Development server (connect) with livereload
- Unit and integration testing framework (karma)
- Choice between Javascript (default) and Coffeescript
- Project scaffolding (index.html, scripts/style/images directories, etc)
- Generators for routes, controllers, views, directives, etc.
- Sass/Compass and Coffeescript watch & compilation
- Production build tasks (uglify, css min, static versioning, concat, etc)

If Angular isn't your thing, there are also [dozens of other Yeoman
generators][5] that are worth checking out, including `generator-generator`
which is a generator that helps build your own generators. Xzibit would be proud.

I'm going to be writing this targeted at Linux/Mac, but Windows users *should* be
able to follow along, as most of the commands are similar.

## Getting started

The first thing is to make sure we have Node available, as everything in this article relies on it. If you have `node` and `npm` commands available to you, you're probably good to go and can skip this part.

For installating Node, I'd recommend
[nvm][1015] if you're on Linux/Mac, or the Windows installer from [the Node homepage][1001]. Much like pyenv/rbenv/rvm, nvm allows us to install, manage, and switch seamlessly between Node versions. *Highly recommended*.
 
    $ curl -O https://raw.github.com/creationix/nvm/master/install.sh
    $ cat install.sh         # Let's see what they want us to install
    $ sh install.sh && source ~/.nvm/nvm.sh
    $ nvm install 0.10   # Stable minor branch at time of writing
    $ nvm use 0.10
    $ node --version
      v0.10.22

Once we have Node, we'll install `generator-angular` which will also automatically install Yeoman, Grunt, and Bower. Then we'll run the generator to
scaffold our application by answering some questions about our project.  We're
going to go with the defaults for this install, but on future projects feel
free to ditch Bootstrap. However, I'd recommend keeping the default Angular
modules unless you have a compelling reason to strip them out.
 
    $ npm install -g generator-angular
    $ mkdir myApp && cd myApp
    $ npm install generator-angular    # Local install to myApp
    $ yo angular:app myApp    # Add the --coffee flag for coffescript

    [?] Would you like to include Twitter Bootstrap? (Y/n)
    [?] Would you like to use the SCSS version of Twitter Bootstrap with the Compass CSS Authoring Framework? (Y/n)
    [?] Which modules would you like to include? (Press <space> to select)
    ❯⬢ angular-resource.js
     ⬢ angular-cookies.js
     ⬢ angular-sanitize.js
     ⬢ angular-route.js

After answering these configuration questions, Yeoman will take a minute to 
scaffold our project files and pull down Node and Bower modules. Once that
finishes, we'll have our development environment all set
up.

Here are some relevant directories/files that Yeoman made for us:

    ▾ app/               # Main directory for application
      ▾ scripts/         # Angular js/coffee directory where most of our
        ▸ controllers/   #   yeoman-generated modules will go 
        app.js           # Main application js file
      ▸ styles/          # css/scss
      ▸ views/           # Angular views
        index.html       # Entry point to our single page app
    ▸ test/              # Tests (shocking, I know)
      bower.json         # Bower configuration file
      Gruntfile.js       # Grunt configuration file
      package.json       # Node/npm configuration file

## Grunt work

Assuming everything went smoothly, we should be able to start our server with Grunt.
Running `grunt server` will fire off a bunch of tasks, the last one being the 
"watch" task which monitors our html/scss/css/js/coffee/etc files and 
recomplies as necessary.

    $ grunt server
    # ... Grunt will start a bunch of tasks 
    Running "watch" task
    Waiting...

Somewhere before Grunt enters the "watch" task, it will open a browser tab pointed
to `http://127.0.0.1:9000` which should be the front page of our app: some
chipper dialogue with a big, green "Splendid!" button.

<p>
  <a class="imglink" href="/assets/posts/images/ng-generator-1.png">
    <img src="/assets/posts/images/ng-generator-1.png">
  </a>
</p>

All of the features promised in the intro are now available to us and we can
focus on developing our app, which is a great place to be after issuing just a half
dozen commands in a terminal (Node installation not withstanding).

Now let's turn to how Yeoman can help us in fleshing out our application with its
other generators.

## Let it all Ang out

The focus of this post is generator-angular so some Angular knowledge is
assumed for this section. As long as you're familiar with MVC frameworks you
should be able to follow along. If you're looking for more how-to-Angular, I
recommend the classic [Egghead.io videos][6].

When we ran `yo angular:app myApp`, we used only one of the dozen or so available generators. We can get the list of
available generators by typing `yo --help`, but here's a better reference:

- [angular](https://github.com/yeoman/generator-angular#app) (aka [angular:app](https://github.com/yeoman/generator-angular#app))
- [angular:controller](https://github.com/yeoman/generator-angular#controller)
- [angular:directive](https://github.com/yeoman/generator-angular#directive)
- [angular:filter](https://github.com/yeoman/generator-angular#filter)
- [angular:route](https://github.com/yeoman/generator-angular#route)
- [angular:service](https://github.com/yeoman/generator-angular#service)
- [angular:provider](https://github.com/yeoman/generator-angular#service)
- [angular:factory](https://github.com/yeoman/generator-angular#service)
- [angular:value](https://github.com/yeoman/generator-angular#service)
- [angular:constant](https://github.com/yeoman/generator-angular#service)
- [angular:decorator](https://github.com/yeoman/generator-angular#decorator)
- [angular:view](https://github.com/yeoman/generator-angular#view)

We're going to use a few of them now to create a new `foo` route, with a
matching controller and view. Since we want all three to be named `foo`,
we can take a shortcut by just using the route generator, which will call the
controller and view generators in turn.

    $ yo angular:route foo
      invoke   angular:controller:/path/to/myApp/node_modules/generator-angular/route/index.js
      create     app/scripts/controllers/foo.js
      create     test/spec/controllers/foo.js
      invoke   angular:view:/path/to/myApp/node_modules/generator-angular/route/index.js
      create     app/views/foo.html

So what did this do for us?

- Created a `foo` controller with a matching test
- Created a `foo` view
- Added a `foo` route in the main `app.js` file, lacing up the controller and view
- Added a `<script>` tag to `index.html` to load the controller

If we were to go to `http://127.0.0.1:9000/#/foo` now, we would see the
stunningly beautiful sight of "This is the foo view" on a blank page. At this point
we would edit the files we just created to make our foo page into something.

The other angular generators are much the same in their functionality - they exist to
save time by handling all the monotonous scaffolding tasks.

## Production build

Once our app has gotten to the point where we want to release it, we'll want to use the `grunt build` task. This will take our site and build an optimized version for deployment.

    $ grunt build
    # ... Tasks running ... 
    Done, without errors.

    Elapsed time
    concurrent:dist       8s  ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 84%
    autoprefixer:dist  172ms  ▇ 2%
    ngmin:dist         258ms  ▇ 3%
    copy:dist          291ms  ▇ 3%
    uglify:generated   513ms  ▇▇ 6%
    Total 9s

Once the build finishes, we'll have a `dist` directory that we can push to a production server. Since Angular is completely a frontend framework this can be a simple static server like S3, or as part of the static assets of a backend server.

## We all Grunt differently

In this article, we've used just the Grunt tasks that generator-angular created for us. While providing tons of common functionality and a good baseline, it won't fit everyone's needs. A nice thing about generator-angular is that it produces what can be thought of as a Gruntfile boilerplate that we can add to or modify.

Need to build to `../../some/other/path/build` instead of `dist`? Just change `yeoman.dist` at the top of the `grunt.initConfig` function. Want to use Less instead of Sass/Compass? Install [grunt-contrib-less][7], add a `less` configuration block, and call the `less` task wherever `compass` would get called. Want to use Angular's [html5Mode][] and pushState for prettier urls? [I've got us covered][10]. We haven't even scratched the surface of [available Grunt packages][8].

One cautionary note is that the more you modify your Gruntfile, the harder it will be to update to a new version of generator-angular for a given project. It's currently at v0.6.0-rc1, which means the project has the potential for rapid and deep change. Even so I think it's a productivity win using generator-angular and modifying to suit, even if you do risk some time updating in the future.



[1000]: https://npmjs.org/
[1001]: http://nodejs.org/
[1015]: https://github.com/creationix/nvm
[0]: http://gruntjs.com/
[1]: http://bower.io/
[2]: http://yeoman.io/
[3]: https://github.com/yeoman/generator-angular
[4]: http://yeoman.io/gettingstarted.html
[5]: http://yeoman.io/community-generators.html
[6]: http://egghead.io/lessons
[7]: https://github.com/gruntjs/grunt-contrib-less
[8]: http://eirikb.github.io/nipster/#grunt
[10]: /2013/11/16/angular-html5mode-using-yeoman-generator-angular/
[html5Mode]: http://docs.angularjs.org/guide/dev_guide.services.$location#general-overview-of-the-api_$location-service-configuration
[twitter]: https://twitter.com/jasontrill
[gitissues]: https://github.com/jjt/jjt.github.io/issues
