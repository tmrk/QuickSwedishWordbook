'use strict';

function t(tag, content, listener) {
    var el = document.createElement(tag.split('#')[0].split('.')[0].split('|').shift());
    if (tag.split('#')[1]) el.id = tag.split('#')[1].split('.')[0].split('|')[0];
    if (tag.split('.')[1]) el.classList.add(...tag.split('.').slice(1).join('.').split('|')[0].split('.'));
    if (tag.split('|')[1]) {
        var attrTemp = tag.split('|').slice(1);
        for (var i = 0; i < attrTemp.length; i++) el.setAttribute(attrTemp[i].split('=')[0], attrTemp[i].split('=')[1]);
    }
    if (content) {
        if (typeof content === 'string') el.appendChild(document.createTextNode(content));
        else if (content.constructor === Array) for (var i = 0; i < content.length; i++) {
            if (typeof content[i] === 'string') el.appendChild(document.createTextNode(content[i]));
            else el.appendChild(content[i]);
        }
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
}).then(function(words) {
    words = words.words;

    function getArticle(query) {
        var wordList = words.filter(function(el) {
            return el.form.toLowerCase().replace(/[0-9,~]/g, '').startsWith(query.toLowerCase());
        });
        return {
            wordList: wordList
        }
    }

    document.body.appendChild(
        t('div#wrapper', [
            t('input#word|placeholder=Type a word to look up', '', {'input': function() {
                var main = document.getElementById('main');
                main.innerHTML = '';
                if (this.value) {
                    document.getElementById('wrapper').classList.add('on');
                    var search = getArticle(this.value);

                    var filtered = t('ul#filtered'),
                        result = t('div#result');

                    var wordList = search.wordList;

                    main.appendChild(filtered);
                    main.appendChild(result);

                    for (var i = 0; i < wordList.length; i++) {
                        if (isNaN(wordList[i].form.slice(-1))) {
                            filtered.appendChild(t('li', wordList[i].form.replace('~','')));
                        } else if (wordList[i].form.slice(-1) == '1') {
                            filtered.appendChild(t('li', wordList[i].form.slice(0, -2).replace('~','')));
                        }
                    }
                    function showWord(word) {
                        if (word) {
                            var formattedWord = (word.form && isNaN(word.form.slice(-1))) ?
                                t('h1', word.form) : word.form ?
                                t('h1', [
                                    word.form.slice(0, -2),
                                    t('sup', word.form.slice(-1))
                                ]) : '',
                                pronunciation = word.pronunciation ? t('span.pronunciation', ' | ' + word.pronunciation + ' |') : '',
                                pos = word.pos ? t('span.pos', word.pos) : '',
                                inflection = word.inflection ? t('span.inflection', ' (' + word.inflection + ')') : '',
                                lexeme = t('div.lexeme');

                            for (var i = 0; i < word.lexeme.length; i++) {
                                var definition = word.lexeme[i].definition ? t('span.definition', word.lexeme[i].definition) : '',
                                    definition_comm = word.lexeme[i].definition_comm ? t('span.definition_comm', word.lexeme[i].definition_comm) : '',
                                    valency = word.lexeme[i].valency ? t('span.valency', word.lexeme[i].valency) : '',
                                    grammat_comm = word.lexeme[i].grammat_comm ? t('span.grammat_comm', word.lexeme[i].grammat_comm) : '',
                                    example = word.lexeme[i].example ? t('span.example', word.lexeme[i].example.join(', ')) : '',
                                    usage = word.lexeme[i].usage ? t('span.usage', word.lexeme[i].usage) : '';

                                lexeme.appendChild(t('p', [definition, valency, grammat_comm, example, usage]));
                            }
                            result.appendChild(t('div.word', [formattedWord, pronunciation, t('br'), pos, inflection, lexeme]));
                        }
                    }
                    showWord(wordList[0]);
                    if (wordList[0] && wordList[0].form.slice(-1) == '1') for (var i = 1; i < wordList.length; i++) {
                        if (isNaN(wordList[i].form.slice(-1)) || wordList[i].form.slice(-1) == '1') break;
                        showWord(wordList[i]);
                    }
                } else document.getElementById('wrapper').classList.remove('on');
            }}),
            t('div#main')
        ])
    );
    document.getElementById('word').focus();
});
