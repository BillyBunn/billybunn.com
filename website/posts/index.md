---
title: Posts
layout: page.njk
---
<ul>
  {%- assign sorted = collections.posts | sort: 'url' -%}
  {%- for post in sorted -%}
  <li><a href="{{ post.url }}">{{ post.url }}</a></li>
  {%- endfor -%}
</ul>
