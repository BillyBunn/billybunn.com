/*
Full credit to Jeff Kreeftmeijer
https://jeffkreeftmeijer.com/nodejs-purge-minify-css/

Takes an HTML string, outputs HTML string with purgeCSS run on its inline styles (anything in a <style> tag)
*/
const postcss = require("postcss");
const purgecss = require("@fullhuman/postcss-purgecss");
const regex = /<style>(.*?)<\/style>/gs;

module.exports = async function crushCSS(input) {
  // takes input string calls matchAll() to return an iterator of all results matching regex (stuff within <style> tags), spreads to array
  //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
  // runs postcss against each matching result
  let promises = [...input.matchAll(regex)].map((match) => {
    /* "The match array has the matched text as the first item, and then one item for each parenthetical capture group of the matched text."
      So 'match' is an array of 
      [
        0: full match (includes surrounding <style> tags), 
        1: first capture group (everything within <style> tags),
        2: the index of the match,
        3: the full input string
    ] */
    return process(match, input);
  });
  let replacements = await Promise.all(promises);
  return input.replace(regex, () => replacements.shift());
};

function process(match, html) {
  return (
    postcss([
      purgecss({
        // pass raw, full HTML string, sans everything within <style> tags
        content: [{ raw: html.replace(match[1], "") }],
      }),
    ])
      // .process(match[1]) runs purgecss on CSS within <style> tags, looking at the HTML with  <style> tags removed
      .process(match[1])
      .then((result) => {
        // return entire <style> tag & contents, with purgedcss results
        return match[0].replace(match[1], result.css);
      })
  );
}
