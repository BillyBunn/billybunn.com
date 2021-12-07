---
title: Knockout text
layout: post.njk
date: 2021-12-04
---

I had some fun recently with making fun, colored "knockout" text on this site. 

I heavily referenced [this CSS-Tricks article](https://css-tricks.com/how-to-do-knockout-text/) and [this more recent one](https://css-tricks.com/css-techniques-and-effects-for-knockout-text/). But I still ran into a few gotchas. 

You can't forget to add the right browser prefix: `-webkit-background-clip`.

When text wrapped in Safari, the background did not extend down to the additional lines. 

<!-- CodePen example -->

I found I had to add this to fix it. 
```
box-decoration-break: clone;
-webkit-box-decoration-break: clone;
```

I'm happy with the effect. I went off of this simple gradient animation generator
<!-- link -->

and literally googled "vaporwave color pallete".

<!-- Codepen of final product -->