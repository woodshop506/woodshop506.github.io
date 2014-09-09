---
published: true
title: Building a board game with React.js
layout: post
---

## DEFCON: Fun

If you like board games and are looking for an intense 1v1 Cold War experience where luck plays a small but not insignificant part, look no further than [Twilight Struggle](http://en.wikipedia.org/wiki/Twilight_Struggle). There's a good reason it's [#1 on BoardGameGeek](http://boardgamegeek.com/browse/boardgame). Its simple mechanic belies a deeper strategic richness.

[![Twilight Struggle Board](http://twistrug.jjt.io/images/tsboard-sm.jpg)](http://twistrug.jjt.io/images/tsboard.jpg)

The best synopsis I've read is from a [BGG review](http://boardgamegeek.com/thread/471953/rogers-reviews-deluxe-twilight-struggle-comprehens):

> Twilight Struggle is a card driven game played over a maximum of 10 turns. The game may end sooner (and frequently does).

>[It] is fundamentally a game about area control. There are six geopolitical regions on the map: Europe (split into Eastern and Western Europe subregions), Asia (including the Southeast Asia subregion), the Middle East, Africa, Central America, and South America. Within each region are countries that have a stability number, representing how stable the government tends to be. 

> Having control of countries helps determine whether you have presence, domination, or control of a region, which in turn helps you earn victory points. Within each region, there are a number of battleground countries, which are considered key to the region.

I was hooked from my first play and soon started searching out a resource for learning about the 110 unique cards. I came across the inimitable [Twilight Strategy](http://twilightstrategy.com/) but quickly became overwhelmed by each card page referencing at least six other cards, all unlinked. So I made [TwiStrug](http://twistrug.jjt.io) as a way to learn the cards more readily (hyperlinks!). Then I started thinking about how to optimize the board layout for a smaller screen, which then quickly spiralled out of control into building a playable virtual board because hey, I'm that kind of nerd.

The tool of choice for such an undertaking? [React](http://facebook.github.io/react/index.html), with a [router](https://github.com/flatiron/director) and other libs of sundry to glue everything together.

## React

React components at their core are very simple to reason about. They're encapsulated objects with *properties*, *state*, and a `render()` method that renders the component. A component's `render()` method functions as a template that contains markup and/or other React components.

Component properties should be treated as immutable and are passed in by either the top-level [`React.renderComponent()`](http://facebook.github.io/react/docs/top-level-api.html#react.rendercomponent)) function or a parent React component. State is mutable, internal to a component, and shouldn't be modified from outside. Whenever the properties or state of a component change, React renders the component but only modifies the DOM if anything changed. How? By rendering components to a *virtual DOM* then [efficiently diffing it](http://calendar.perfplanet.com/2013/diff/) with the actual DOM, changing only what's necessary.

Beyond the basics, React components also have [events](http://facebook.github.io/react/docs/events.html), [mixins](http://facebook.github.io/react/docs/reusable-components.html#mixins), and a number of [lifecycle methods](http://facebook.github.io/react/docs/component-specs.html) for fine-grained control.

## TwiStrug <span class="subhead">(codename: "Twist Rug")</span>

TwiStrug is structured around nested React components. There's a main React component, [`TwiStrug`](https://github.com/jjt/TwiStrug/blob/master/src/Twistrug.coffee), with a [router](https://github.com/jjt/TwiStrug/blob/master/src/router.coffee) mixed in. This is the entry point for the app and handles all routing and top-level controller concerns.

I use [Browserify](http://browserify.org/) to bundle almost everything, including [card](https://github.com/jjt/TwiStrug/blob/master/app/data/cards.json) and [board](https://github.com/jjt/TwiStrug/blob/master/app/data/map-data.json) data. I'm using Browserify transforms [coffeeify](https://github.com/jnordberg/coffeeify)
to compile CoffeeScript, and [bulkify](https://github.com/substack/bulkify) which lets us write [one-line index modules](https://github.com/jjt/TwiStrug/blob/master/src/libs/index.coffee):

    # libs/sum.coffee
    module.exports = (a,b) -> a + b
    
    # libs/index.coffee
    module.exports = require('bulk-require')(__dirname, ['*.coffee'])
        
    # main.coffee
    libs = require('./libs')
    libs.sum(2,5)
    // 7
    
The application [file structure](https://github.com/jjt/TwiStrug/tree/master/src) is pretty simple:

    views/            React components, each in its own file  
    pages/            Views that represent a url (#/cards, #/board, etc)  
    libs/             A melting pot of classes and utility functions  
    TwiStrug.coffee   Main entry point  
    router.coffee     Routing mixin for above  

The app takes incoming routes and sets the state of `TwiStrug` to the appropriate key to load a view from `/pages`. When React detects that change in state, it runs [`TwiStrug.render()`](https://github.com/jjt/TwiStrug/blob/master/src/Twistrug.coffee#L55) and shows the page. To change pages, just change the state of the main component. Easy peasy.

## Virtual Board

[![TwiStrug virtual board](http://twistrug.jjt.io/images/home-board.jpg)](http://twistrug.jjt.io/#/board)

When you think about it, game boards are just a physical representation of the state of a game at any given time. When a player moves their token from one place to another it's like updating an object in memory (or creating a new immutable state object if that's your thing). On most physical boards, the state and its display are one and the same. On a computer, they are decoupled. React is a perfect fit for doing a board game because you just have to worry about changing the game state and React will automatically figure out what needs to change to display the board.

State can quickly become unwieldy if it's scattered hither and yon, so I elected to keep all of the game state in the main board component, [`Board`](https://github.com/jjt/TwiStrug/blob/master/src/views/Board.coffee#L86). I implemented an [action history](https://github.com/jjt/TwiStrug/blob/master/src/libs/StateHistory.coffee) which is an array of objects, each comprised of the new board state and metadata about the state change. At the risk of sounding like a broken record, React makes stepping through the history almost trivially easy. When a user undoes/redoes an action, we just have to grab the state from the history, set `Board.state.game` and voila, the board is back to where it was.

I designed the board for local play, but a user on BGG suggested that a sharable state through the url would enable remote play. So every time the board state is updated, the url reflects the change. Turns out that the entire board can fit handily into 176 characters: 8 for the game stats (DEFCON, score, turn, etc.), and 168 for the influence points in 84 countries. So whenever the board page is (re)loaded, it checks for a board state from the url, then localStorage, then finally the initial setup (representing a new game), and sets the board based on the first one found.

[`Board.render()`](https://github.com/jjt/TwiStrug/blob/master/src/views/Board.coffee#L273) renders sub-components whose properties are comprised of `Board.props` (country info+positions) and `Board.state`. None of the sub-components have their own state (with the exception of the dice) which makes things nice and easy to reason about. However, this means that we have to have some way of a child component letting its parent know that an action has taken place, such as moving DEFCON from 4 to 3. The recommended way is for the parent to pass a handler method as a property on the child component.

For example let's look at what happens when someone interacts with a [`BoardStatusValue`](https://github.com/jjt/TwiStrug/blob/master/src/views/BoardStatusValue.coffee) component to move DEFCON from 4 to 3. The arrows each have an [`onClick`](https://github.com/jjt/TwiStrug/blob/master/src/views/BoardStatusValue.coffee#L15) handler, which is `@props.handleValClick()`. This handler is passed in as a property by its parent component, [`BoardStatus`](https://github.com/jjt/TwiStrug/blob/master/src/views/BoardStatus.coffee#L61), which in turn is a property passed in from [`Board`](https://github.com/jjt/TwiStrug/blob/master/src/views/Board.coffee#L336). So when someone clicks an arrow in `BoardStatusValue`, it's really calling `Board.handleValClick()`. This system works, and it preserves the idea that components should have no knowledge of their parents, but it would quickly become tedious if we had a dozen such click handlers spread across numerous deeply-nested components. Even so, React is a great choice for representing a stateful system like a board game.

## Keyboard all the things!!
I'm BFFs with my keyboard, as any developer should be. Consequently, everything on the TwiStrug board is controllable by keyboard shortcuts, right down to rolling the dice. My favorite part of the whole project has to be how the influence placement turned out. Here's a short gif/gfy/webm of a standard USSR setup:

<a href="http://twistrug.jjt.io/data/twistrug-ip-keyboard-placement-720p.webm" title="Click for 720p webm"><img class="gfyitem" data-id="ClearcutAdolescentCoelacanth" /></a>

I used the following sequence to record that video:
    
        i               // Start (I)PbK mode
        e               // Select (E)urope
        e               // Select (E)ast Germany
        r enter         // +1 USSR in East Germany, confirm
        p               // Select (P)oland
        r r r r enter   // +4 USSR in Poland, confirm
        y               // Select (Y)ugoslavia 
        r enter         // +1 USSR in Yugoslavia, confirm
        esc             // Exit Europe selection
        esc             // Exit IPbK mode
    
It looks even better without comments or newlines: `i e e r enter p r r r r enter y r enter esc esc`. I went slowly in the video to demonstrate the system - once you learn the shortcuts it's quick to do everything on the board.

## Card Reference

[![TwiStrug Card Reference](http://twistrug.jjt.io/images/home-cards.jpg)](http://twistrug.jjt.io/#/cards)

Not too much to write about for this one. The [`Cards`](https://github.com/jjt/TwiStrug/blob/master/src/pages/Cards.coffee) page component has three stateful parts: sort order, filtering by card id, and a toggle to show the full text of the card. Whenever any of those change from a user interacting with the controls, changing the url, or reloading the page, React updates the page accordingly by [sorting and filtering the set of cards](https://github.com/jjt/TwiStrug/blob/master/src/pages/Cards.coffee#L137-L149) and rendering them. Unlike other view layers where you might have to distinguish between the state on page load and in response to user action, a React component doesn't care. It's concerned with props and state, that's it.

Each card has a detail page with a [simple component](https://github.com/jjt/TwiStrug/blob/master/src/pages/Card.coffee) that just renders the data for the card. All of the logic for loading a given card and navigating between the cards is in [the router](https://github.com/jjt/TwiStrug/blob/master/src/router.coffee#L45-L53).

## Refactoring and Hindsight

`views/Board` is pretty chunky. In addition to the keyboard IP placement stuff, it's got a bunch of board state logic which should be moved into a separate model. This would make `views/Board` less of a *viewModel* and more of a pure *view*. The coupling isn't too concerning though, as the board is only really used in that one view.

I'm a huge fan of [CoffeeScript](http://coffeescript.org/) and use it wherever I can. I didn't want to give it up to use [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html), so I used the bare `React.DOM` methods as outlined in [a blog post](http://blog.vjeux.com/2013/javascript/react-coffeescript.html) by React developer [Vjeux](https://twitter.com/Vjeux). It works for the most part but I had to straddle the syntactical line between brittle and overwrought, with all of the extra brackets. I'd like to move the [return value](https://github.com/jjt/TwiStrug/blob/master/src/views/BoardNodeIP.coffee#L31-L48) of each `render()` method into its own JSX module, and treat it much like a traditional template (Jade, Handlebars, etc). JSX compilation would be handled by a Browserify transform: [reactify](https://github.com/andreypopp/reactify).

The board state is a structured object, and something like [Cortex](https://github.com/mquan/cortex) would be useful. Either that or I should switch the representation of board state from a nice object to its 176-char encoded form and use functions or board model methods to decode/encode when necessary. Either solution would make it easier for React to pick up on state changes and eliminate the few `shouldComponentUpdate()` methods that I defined (likely a premature optimization). 

## My React-ion <span class="subhead">(harharhar)</span>

Interacting with the DOM and keeping it in sync with state in a performant and robust way can be one of the hardest parts of designing web apps these days. The push for true two-way binding and excitement around [Object.observe](http://bocoup.com/weblog/javascript-object-observe/) should illustrate this. React saves developers time and headache by treating the DOM as a stateless canvas and re-rendering a component based on its state.

And to top it all off the [#reactjs IRC](http://jsfiddle.net/vjeux/Zf5sQ/) is well populated and the React developers are usually there, willing to lend a hand. I've asked a couple of stupid/obvious questions and they were answered fully and without a hint of impatience.

I wouldn't be surprised if React found its way into the Backbones, Embers, and Angulars of the future. Or dispatching the MVC paradigm entirely, there's [Flux](http://facebook.github.io/react/docs/flux-overview.html) for large sites, or homespun MVC-ish architectures like that used in TwiStrug for smaller sites.

*TL;DR I ♥ React*

<script>
 (function(d, t) {
    var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
    g.src = 'http://assets.gfycat.com/js/gfyajax-0.517d.js';
    s.parentNode.insertBefore(g, s);
}(document, 'script'));
</script>