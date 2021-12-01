const fs = require("fs");
const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget("./website/css/");

  /**
   * Minifies HTML and CSS, removes comments
   * https://www.11ty.dev/docs/config/#transforms
   */
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (this.outputPath && this.outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        collapseWhitespace: true,
        minifyCSS: { level: { 1: { specialComments: "0" } } },
        removeComments: true,
        useShortDoctype: true,
      });
      return minified;
    }
    return content;
  });

  /**
   * Servers 404 page on errors
   */
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
