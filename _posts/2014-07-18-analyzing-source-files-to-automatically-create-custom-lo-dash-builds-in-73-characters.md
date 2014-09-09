---
published: true
title: "Analyzing source files to automatically create custom Lo-Dash builds in 73 characters"
layout: post
---

## TL;DR

    $> lodash include=$(ack '_\.(\w*)' -h --output '$1' | sort -u | tr '\n' ',')

## Underscore/Lo-Dash
For those who don't know about [Lo-Dash](http://lodash.com/), it's an enhanced version of [Underscore](http://underscorejs.org/) that brings about performance, additional features, and customization in builds. If you haven't heard of Underscore/Lo-Dash or haven't seen the eponymous `_.` in code, do yourself a favour and check them out. But use Lo-Dash instead of Underscore.

## Modular Builds
One of the best parts of the last few years in Javascript development is a trend away from monolithic libraries toward breaking down code into small, narrowly-focused modules and composing/combining them into larger modules as needed. This has numerous benefits, one of which is a reduced download size for our users. To this end the [Lo-Dash CLI](http://lodash.com/custom-builds) can compile custom builds with only the functions you specify. For example, if all you wanted from Lo-Dash was [`_.pluck`](http://lodash.com/docs#pluck) and [`_.zipObject`](http://lodash.com/docs#zipObject), you could generate a build with the following command:

    $> lodash include=pluck,zipObject
    
That's all well and good if you know which functions you'll use ahead of time. But during development I find myself dipping liberally into Lo-Dash's bucket of functions, so I include the full library. For deployment, I'd like to build a minimal Lo-Dash library comprised of only the functions I actually use in my code.

Since I'm <del>lazy</del> a developer, I don't want to have to parse through my code manually to determine which Lo-Dash functions I used. When I was using [Grunt](http://gruntjs.com/) as my task runner I built an npm module, [grunt-lodash-autobuild](https://github.com/jjt/grunt-lodash-autobuild), to automate the process. Pretty simple stuff: it uses `shell.grep` to find all of the calls to Lo-Dash functions and passes the names to [grunt-lodash](https://github.com/lodash/grunt-lodash) which does the actual build.

Now that I'm on [Gulp](http://gulpjs.com/)\*, I wanted to replicate that Grunt plugin and started reading about best practices for Gulp plugins. Then it hit me: composition of small, narrowly-focused modules. That's right in line with the Linux/UNIX design philosophy.

\**note: As of publication time. Tomorrow I might have switched to Broccoli, and next week the new new new hotness in build systems.*

## Composability
Since we can rely on the Lo-Dash CLI, all we have to do is get all of the function names in our source code, format them, and pass them as an argument to `lodash`.

To do this, we'll start by using [Ack](http://beyondgrep.com/) to get a list of all Lo-Dash functions that we've used in our code. I'm sure that grep could easily handle this job as well, but Ack has been a welcome addition for me over the past few years. It's portable, fast, has better output by default, and has great configuration options (per-directory `.ackrc` files are fantastic).

Since the Lo-Dash function names are all camelCase, we can use a simple regular expression that captures just the function name: `_\.(\w*)`. The `-h` flag suppresses the filename output and `--output '$1'` tells Ack that we want to output the first capture group instead of the entire match with surrounding line:

    $> ack '_\.(\w*)' -h --output '$1'
    union
    zipObject
    pluck
    find
    find
    find
    
    isArray
    
    merge
    sortBy
    
    assign
    #...

Great, so now we have a large list of all the function names. Only problem is the whitespace and duplicated function names. So we run that through [`sort`](http://unixhelp.ed.ac.uk/CGI/man-cgi?sort), with the `--unique` or `-u` flag which - you might want to sit down - gives us a sorted list with duplicates removed:

    $> ack '_\.(\w*)' -h --output '$1' | sort -u
    assign
    contains
    each
    find
    isArray
    map
    merge
    pluck
    random
    sortBy
    union
    zipObject

Then on to the next UNIX workhorse, [`tr`](http://unixhelp.ed.ac.uk/CGI/man-cgi?tr). We want to replace all newlines (`'\n'`) with commas (`','`):

	$> ack '_\.(\w*)' -h --output '$1' | sort -u | tr '\n' ','
    assign,contains,each,find,isArray,map,merge,pluck,random,sortBy,union,zipObject,
    
The Lo-Dash CLI doesn't complain about the trailing comma. If it did, we could just pipe the output of `tr` into `sed 's/,$//'` to strip it out.

And now we're done! We just need to feed the previous output into the `include` parameter of `lodash`:
		
     $> lodash include=$(ack '_\.(\w*)' -h --output '$1' | sort -u | tr '\n' ',')
     
This could easily be integrated with your task runner of choice by wrapping it in a shell call, or just triggered manually if you eschew Gulp et al and like to roll it raw.

Composition. It's what's for dinner.