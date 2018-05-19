'use strict';

const html2text = require('html-to-text');;
const marked = require('marked');
const through = require('through2');

module.exports = function (verb) {
    verb.use(require('verb-generate-readme'));
    verb.use(require('verb-toc'));

    verb.task('chrome-readme', () => {
        return verb.src('./docs/chrome/.verb.md')
            .pipe(verb.renderFile('md'))
            .pipe(verb.dest((file) => {
                file.path = './docs/chrome/README.md';
                return file.base;
            }));
    });

    verb.task('chrome-description', ['chrome-readme'], () => {
        return verb.src('./docs/chrome/README.md')
            .pipe(through.obj((file, enc, next) => {
                const content = file.contents.toString();       // get the README contents as a string
                const html = marked(content);                   // convert the markdown to HTML
                let text = html2text.fromString(html, {         // convert the HTML to formatted plaintext
                    'wordwrap': false,
                    'ignoreHref': true,
                    'ignoreImage': true,
                    'preserveNewlines': true,
                    'unorderedListItemPrefix': '- '
                });
                text = text.replace(/^\s+$/gm, '');             // remove lines with only whitespace characters
                text = text.replace(/(\S)(- .*)\n/gm, '$1\n    $2\n');    // fix sub-bullets not starting on their own line
                file.contents = text;
                next(null, file);
            }))
            .pipe(verb.dest((file) => {
                file.path = './docs/chrome/description.txt';
                return file.base;
            }));
    });

    verb.task('chrome', ['chrome-readme', 'chrome-description']);

    verb.task('firefox', () => {
        return verb.src('./docs/firefox/.verb.md')
            .pipe(verb.renderFile('md'))
            .pipe(verb.dest((file) => {
                file.path = './docs/firefox/README.md';
                return file.base;
            }));
    });

    verb.task('default', ['chrome', 'firefox', 'readme']);
}
