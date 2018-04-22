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

    function findWord(word) {
        var wordsToShow = words.filter(function(el) {
                return el.form.toLowerCase().replace(/[0-9,~]/g, '').trim() == word;
            });
        if (wordsToShow[0] && wordsToShow[0].form.slice(-1) == '1') for (var i = 1; i < wordsToShow.length; i++) {
            if (isNaN(wordsToShow[i].form.slice(-1)) || wordsToShow[i].form.slice(-1) == '1') break;
        }
        return wordsToShow;
    }

    function showWord(wordsToShow) {
        if (wordsToShow) {
            document.getElementById('result').innerHTML = '';
            for (var i = 0; i < wordsToShow.length; i++) {
                var word = wordsToShow[i],
                    formattedWord = (word.form && isNaN(word.form.slice(-1))) ?
                    t('h1', word.form) : word.form ?
                    t('h1', [
                        word.form.slice(0, -2),
                        t('sup', word.form.slice(-1))
                    ]) : '',
                    pronunciation = word.pronunciation ? t('span.pronunciation', ' | ' + word.pronunciation + ' |') : '',
                    pos = word.pos ? t('span.pos', word.pos) : '',
                    inflection = word.inflection ? t('span.inflection', ' (' + word.inflection + ')') : '',
                    lexeme = t('div.lexeme');
                if (word.lexeme) {
                    for (var ii = 0; ii < word.lexeme.length; ii++) {
                        var lex = word.lexeme[ii] ? word.lexeme[ii] : {},
                            definition = lex.definition ? t('span.definition', lex.definition) : '',
                            definition_comm = lex.definition_comm ? t('span.definition_comm', lex.definition_comm) : '',
                            valency = lex.valency ? t('span.valency', lex.valency) : '',
                            grammat_comm = lex.grammat_comm ? t('span.grammat_comm', lex.grammat_comm) : '',
                            example = lex.example ? t('span.example', lex.example.join(', ')) : '',
                            usage = lex.usage ? t('span.usage', lex.usage) : '';

                        lexeme.appendChild(t('p', [definition, valency, grammat_comm, example, usage]));
                    }
                }
                result.appendChild(t('div.word', [formattedWord, pronunciation, t('br'), pos, inflection, lexeme]));
            }
        }
    }

    document.body.appendChild(
        t('div#wrapper', [
            t('input#word|placeholder=Type a word to look up', '', {'input': function() {
                var main = document.getElementById('main')
                    filtered = document.getElementById('filtered'),
                    result = document.getElementById('result');
                filtered.innerHTML = '';
                if (this.value) {
                    document.getElementById('wrapper').classList.add('on');

                    var wordList = words.filter(function(el) {
                        return el.form.toLowerCase().replace(/[0-9,~]/g, '').startsWith(this.value.toLowerCase());
                    }, (this));
                    for (var i = 0; i < wordList.length; i++) {
                        if (isNaN(wordList[i].form.slice(-1))) {
                            filtered.appendChild(t('li', wordList[i].form.replace('~',''), {'click': function() {
                                document.getElementsByClassName('selected')[0].classList.remove('selected');
                                this.classList.add('selected');
                                showWord(findWord(this.innerHTML));
                            }}));
                        } else if (wordList[i].form.slice(-1) == '1') {
                            filtered.appendChild(t('li', wordList[i].form.slice(0, -2).replace('~',''), {'click': function() {
                                document.getElementsByClassName('selected')[0].classList.remove('selected');
                                this.classList.add('selected');
                                showWord(findWord(this.innerHTML));
                            }}));
                        }
                    }
                    filtered.firstChild.classList.add('selected');
                    var wordsToShow = [wordList[0]];
                    if (wordList[0] && wordList[0].form.slice(-1) == '1') for (var i = 1; i < wordList.length; i++) {
                        if (isNaN(wordList[i].form.slice(-1)) || wordList[i].form.slice(-1) == '1') break;
                        wordsToShow.push(wordList[i]);
                    }
                    showWord(wordsToShow);
                } else document.getElementById('wrapper').classList.remove('on');
            }}),
            t('div#main', [
                t('ul#filtered'),
                t('div#result')
            ])
        ])
    );
    document.addEventListener('keydown', function(e) {
        var selected = document.getElementsByClassName('selected')[0];
        switch (e.keyCode) {
            case 40:
                e.preventDefault();
                //down();
                if (selected.nextSibling) {
                    selected.classList.remove('selected');
                    selected.nextSibling.classList.add('selected');
                    showWord(findWord(selected.nextSibling.innerHTML));
                }
                break;
            case 38:
                e.preventDefault();
                //up();
                if (selected.previousSibling) {
                    selected.classList.remove('selected');
                    selected.previousSibling.classList.add('selected');
                    showWord(findWord(selected.previousSibling.innerHTML));
                }
                break;
        }
    });
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('word').focus();
    }, false);
});
