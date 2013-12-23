# browserify-swap [![build status](https://secure.travis-ci.org/thlorenz/browserify-swap.png)](http://travis-ci.org/thlorenz/browserify-swap)

**swap/swäp/** - *an act of exchanging one thing for another*

A transform that swaps out modules according to a config in your package.json selected via an environment variable.

#### package.json

```json
{
  "browserify": {
    "transform": [ "browserify-swap" ]
  },
  "browserify-swap": {
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

```sh
BROWSERIFYSWAP_ENV='dev' browserify . -o bundle.js
```

## Installation

    npm install browserify-swap

## API


## License

MIT
