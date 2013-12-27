# browserify-swap [![build status](https://secure.travis-ci.org/thlorenz/browserify-swap.png)](http://travis-ci.org/thlorenz/browserify-swap)

**swap/swäp/** - *an act of exchanging one thing for another*

A transform that swaps out modules according to a config in your `package.json` selected via an environment variable.

#### package.json

```json
{
  "browserify": {
    "transform": [ "browserify-swap" ]
  },
  "browserify-swap": {
    "@packages": [ "hyperwatch" ],
    "dev": {
      ".*node_modules\/hyperwatch\/\\S+\\.js$": "./swap/some-hyperwatch-swap.js",
      "util.js$": "myutil"
    },
    "test": {
      "util.js$": "test-util"
    }
  }
}
```

- each file matcher (i.e. `'util.js$'`) is a regular expression
- in order to swap files of dependencies the `browserify-swap` transform needs to be injected into its package,
  therefore indicate those packages via the `@packages` array

```sh
BROWSERIFYSWAP_ENV='dev' browserify . -o bundle.js
```

## Installation

    npm install browserify-swap

## API

<!-- START docme generated API please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN docme TO UPDATE -->

<div>
<div class="jsdoc-githubify">
<section>
<article>
<div class="container-overview">
<dl class="details">
</dl>
</div>
<dl>
<dt>
<h4 class="name" id="browserifySwap"><span class="type-signature"></span>browserifySwap<span class="signature">(file)</span><span class="type-signature"> &rarr; {TransformStream}</span></h4>
</dt>
<dd>
<div class="description">
<p>Looks up browserify_swap configuratios specified for the given file in the environment specified via <code>BROWSERIFYSWAP_ENV</code>.</p>
<p>If found the file content is replaced with a require statement to the file to swap in for the original.
Otherwise the file's content is just piped through.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>file</code></td>
<td class="type">
<span class="param-type">String</span>
</td>
<td class="description last"><p>full path to file being transformed</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/browserify-swap/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/browserify-swap/blob/master/index.js#L45">lineno 45</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>transform stream into which <code>browserify</code> will pipe the original content of the file</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">TransformStream</span>
</dd>
</dl>
</dd>
</dl>
</article>
</section>
</div>

*generated with [docme](https://github.com/thlorenz/docme)*
</div>
<!-- END docme generated API please keep comment here to allow auto update -->

## License

MIT
