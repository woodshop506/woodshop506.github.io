---
published: true
title: Some thoughts on web development practices
layout: post
---

In a decade of creating and developing web sites/apps for a variety of clients and employers I've used a lot of different environments and procedures. Here are some random thoughts on what makes for a good experience for everyone involved.

## Git/Hg > SVN > Dreamweaver lock files > no SVC

Well hopefully everyone knows that *any* sort of SVC is better than nothing, even if it is a dumb hard lock a la Dreamweaver. 2004/5 was a wild time.

I've worked for many years with SVN and switched to using Git and Mercurial (Hg) in the past few years, with a preference for Git. With [GitHub][] and [BitBucket][], you get a great UI on the world's best app platform (the Intertubes). The distributed nature of Git/Hg means easier branching and great workflows, and avoids a central point of failure. A previous employer used SVN, hosted from a server in his house. Even though we were only a couple of kilometers away from each other, it was often a high-latency connection and simple things like `svn log` would often take minutes to complete. Frustrating, to say the least.

As to Git vs Hg, Github has soundly won the war for the former. Just look at the traffic for [Github][0] vs that of [BitBucket][1]. Or that 95% of open-source web projects seem to be on Github. Most of the best OSS contributers in web development seem to work on Github projects.

***TL;DR*** *Use Git and Github unless there's a compelling reason not to.*

[Github]: https://github.com
[BitBucket]: https://bitbucket.com

[0]: http://www.alexa.com/siteinfo/github.com
[1]: http://www.alexa.com/siteinfo/bitbucket.org

## Root-relative urls, even in development

A root-relative url is of the form `/path/to/resource`. This can apply to both static assets (`<img src="/images/neat.gif">`) and internal links (`<a href="/posts/about-neat-dot-gif">About neat.gif</a>`). When a browser sees this, it fills in the missing protocol, domain, and (optional) port with that of the site. So if we're on `http://neatgif.com` and we see an img tag pointing to `/images/neat.gif`, the browser resolves this as `http://neatgif.com/images/neat.gif`.

Absolute urls are fine, but they require extra overhead to deal with the changes between development, staging, and production environments. If your framework or build stack deals with this for you in a configuration file, then by all means use absolute urls. But they're not as flexible.

Don't use relative urls. Period. They don't play well with pretty urls (which you're using, right???), and lead to extra overhead determining the correct pathing (*Hmmm.. `../../../images/neat.gif` didn't work... I wonder if it's `../../../../images/neat.gif`...*). Using root-relative paths yeilds a *single* url for a resource, regardless of how deeply nested in directories we are.

But how can you develop multiple sites locally if you have to serve every site out of the root of a domain? Well, by setting up...

## A separate domain for each site you develop

Both Nginx and Apache have support for [virtual hosts][10], which let us alias multiple domain names to different IPs, or the same IP (127.0.0.1, for instance). I'm a fan of Nginx, but either one will work.

The main advantage to using separate domains is that it more closely mirrors production setups. You get separate cookies/localStorage/cache/etc for each site, so that they never interfere with one another.

To set up a development environment where you don't have to add entries to `/etc/hosts`, I recommend DNSMasq. It's [easy to set up][11] so that all domains ending in a fictitious TLD get served locally. I have any domain that matches `*.loc` or `*.node` resolving to `127.0.0.1`, and then Nginx handles each domain with virtual hosts as it sees fit.

You can also use Nginx (and Apache, IIRC) to act as a proxy to other servers, like Node.js. Here's a server block that will proxy any `*.node` domain to `localhost:3000`:

```
   # Node servers, port 3000
    server {
      server_name *.node;
      location / {
        include proxy.conf;
        proxy_pass http://localhost:3000;
      }
    }
```
<small><em>My `proxy.conf` is very similar to [this standard one][12], no magic.</em></small>


So if I want to spin up a new Node.js project about real time neat.gifs, all I have to do is run `node server.js`, and point my browser to `http://neatgifs.node`. [Neat][14].


[10]: http://en.wikipedia.org/wiki/Virtual_hosting
[11]: http://daniel.hahler.de/easy-dns-wildcard-setup-for-local-domains-using-dnsmasq
[12]: http://wiki.nginx.org/FullExample#proxy_conf
[14]: http://i.imgur.com/OtHkTz1.gif

## Use a tool like Grunt to automate repetitive tasks

Humans are very fallible, so whenever I can automate something in the build process, I'm happy. Tools like [Grunt][] or [Gulp][] can help you with this. So instead of having to remember to concatenate then minify your js + css each time you want to pushing to production, you can just run `grunt build` and all of that will be taken care of for you.

Another huge advantage to Grunt is the ability to duplicate workflow between developers. Instead of the css guy having to dig through his shell scripts or history to find the proper `compass` command to let another dev change the css, it can be put into a Gruntfile and checked into source control. Then instead of firing emails/IMs back and forth and copy+pasting commands, the second dev can just run `grunt compass`.

Concat/minify and compass compilation are only a handful of the [more than 2,000 grunt plugins available][20]. Chances are, you can leverage at least a half dozen to make you and your developers' lives easier.

[Grunt]:http://gruntjs.com/
[Gulp]:http://gulpjs.com/
[20]: http://gruntjs.com/plugins

## Embrace package management

Package management systems have many advantages like dependency resolution, easy installation/upgrading, and (in theory) reproducability. Anyone using a form of Linux/Unix will have used them. Anyone using Rails will be familiar with [Rubygems][], Node.js devs will be familiar with [npm][], and even PHP now has [Composer][]. [Bower][] brings these advantages into the world of frontend web code.

Prior to Bower, if I needed to add a js library like [lodash][] to a site I would go to its home page, find the distribution, download it, and unzip into a static folder. Now it's just `bower install lodash --save`. What's that `--save` flag? Oh, that's just Bower adding the installed version of lodash to `bower.json` file.

This means that I can check `bower.json` into source control and not the libraries themselves. After another developer checks out Neatgif.com, all they have to do is run `bower install` and it will download all of the libs automatically, including any dependencies.

When you have a half-dozen libraries (each with deps) and a team of developers, a package management system like Bower really shines.

[Rubygems]: http://rubygems.org/
[Composer]: http://getcomposer.org/
[Bower]: http://bower.io
[npm]: http://npmjs.org
[lodash]: http://lodash.com/