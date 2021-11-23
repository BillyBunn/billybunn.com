const fs = require("fs");
const CleanCSS = require("clean-css");

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget("./website/css/");

  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, bs) {
        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync("./website/_site/404/index.html");
          // Add 404 http status code in request header.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      },
    },
  });

  return {
    dir: {
      input: "website",
      output: "website/_site",
    },
  };
};
