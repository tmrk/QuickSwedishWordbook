'use strict';

function t(tag, content, listener) {
    var el = document.createElement(tag.split('#')[0].split('.')[0].split('|').shift());
    if (tag.split('#')[1]) el.id = tag.split('#')[1].split('.')[0].split('|')[0];
    if (tag.split('.')[1]) el.classList.add(...tag.split('.').slice(1).join('.').split('|')[0].split('.'));
    if (tag.split('|')[1]) {
        attrTemp = tag.split('|').slice(1);
        for (var i = 0; i < attrTemp.length; i++) el.setAttribute(attrTemp[i].split('=')[0], attrTemp[i].split('=')[1]);
    }
    if (content) {
        if (typeof content === 'string') el.appendChild(document.createTextNode(content));
        else if (content.constructor === Array) for (var i = 0; i < content.length; i++) el.appendChild(content[i])
        else el.appendChild(content);
    }
    if (listener) for (var event in listener) if (listener.hasOwnProperty(event)) el.addEventListener(event, listener[event]);
    return el;
}

function appendChildren(parent, children) {
    for (var i = 0; i < children.length; i++)
        parent.appendChild(children[i]);
}

fetch('lexin.json').then(function(response) {
    return response.json();
})
.then(function(words) {
    words = words.words;
    console.log(words);

    function getArticle(word) {

        let filtered = words.filter(function(el) {
            return el.form.toLowerCase().replace(/[0-9,~]/g, '').startsWith(word.toLowerCase());
        }),
            topWord = filtered[0];

        topWord.article = topWord.pos !== 'subst.' ? undefined
                        : topWord.inflection.split(' ')[0].slice(-1)[0] == 'n' ? 'en'
                        : 'ett';

        return {
            topWord: topWord,
            filtered: filtered
        }
    }

    // Building the DOM
    var eee =
        t('div', [
            t('input#word', '', {'input': function() {
                document.getElementById('result').innerHTML = '';
                if (this.value) {
                    var result = getArticle(this.value);

                    var topWordDiv = t('div#topword'),
                        title = t('h1', result.topWord.form),
                        pronunciation = t('span.pronunciation', '| ' + result.topWord.pronunciation + ' |'),
                        article = t('span#article', result.topWord.article),
                        definition = t('ol#definition'),
                        pos = t('span.pos', result.topWord.pos),
                        filtered = t('ul#filtered');


                    appendChildren(topWordDiv, [
                        title, pronunciation, pos, definition, article
                    ]);
                    appendChildren(document.getElementById('result'), [
                        topWordDiv, filtered
                    ]);

                    for (var i = 0; i < result.topWord.lexeme.length; i++) {

                        var lexnr = result.topWord.lexeme[i].lexnr ? t('span.lexnr', result.topWord.lexeme[i].lexnr + ' ') : '',
                            def = result.topWord.lexeme[i].definition ? t('span def', result.topWord.lexeme[i].definition) : '',
                            example = result.topWord.lexeme[i].example ? t('span.example', ': ' + result.topWord.lexeme[i].example.join(', '))  : '';

                        document.getElementById('definition').appendChild(t('li', [lexnr, def, example]))
                    }

                    for (var i = 0; i < result.filtered.length; i++) {
                        //console.log(result.filtered[i])
                        document.getElementById('filtered').appendChild(t('li', result.filtered[i].form));
                    }

                }
            }}),
            t('div#result'),
            t('div#footer', 'Copyright')
        ]);

    document.body.appendChild(eee);

});
