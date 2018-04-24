'use strict';

// Tag generator, syntax: t('tag#id.class|attribute=value', content/[content], {'event': function() {...})
function t(tag, content, listener) {
    var el = document.createElement(tag.split('#')[0].split('.')[0].split('|').shift());
    if (tag.split('#')[1]) el.id = tag.split('#')[1].split('.')[0].split('|')[0];
    if (tag.split('.')[1]) el.classList.add(...tag.split('.').slice(1).join('.').split('|')[0].split('.'));
    if (tag.split('|')[1]) {
        var attrTemp = tag.split('|').slice(1);
        for (var i = 0; i < attrTemp.length; i++) el.setAttribute(attrTemp[i].split('=')[0], attrTemp[i].split('=')[1]);
    }
    if (content) {
        if (typeof content === 'string') el.insertAdjacentHTML('beforeend', content);
        else if (content.constructor === Array) for (var i = 0; i < content.length; i++) {
            if (typeof content[i] === 'string') el.insertAdjacentHTML('beforeend', content[i]);
            else el.appendChild(content[i]);
        }
        else el.appendChild(content);
    }
    if (listener) for (var event in listener) if (listener.hasOwnProperty(event)) el.addEventListener(event, listener[event]);
    return el;
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
                    inflection = word.inflection ? t('span.inflection', '&nbsp;(' + word.inflection + ')') : '',
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
                result.appendChild(t('div.word', [
                    t('span.row1', [formattedWord, pronunciation]),
                    t('span.row2', [pos, inflection]),
                    t('span.row3', [lexeme])
                ]));
            }
        }
    }

    function insertChar(character) {
        var inputField = document.getElementById('word');
        if (inputField.selectionStart || inputField.selectionStart == '0') {
            var startPos = inputField.selectionStart,
                endPos = inputField.selectionEnd;
            inputField.value = inputField.value.substring(0, startPos) + character + inputField.value.substring(endPos, inputField.value.length);
        } else inputField.value += character;
        inputField.focus();
        inputField.selectionStart = inputField.selectionEnd = startPos + 1;
        inputField.dispatchEvent(new Event('input', { 'bubbles': true }))
        document.getElementById('filtered').scrollTop = 0;
    }

    function clearSearch() {
        var inputField = document.getElementById('word');
        inputField.value = '';
        inputField.dispatchEvent(new Event('input', { 'bubbles': true }));
        inputField.focus();
    }

    document.body.appendChild(
        t('div#wrapper', [
            t('div#header', t('h1', 'Quick Swedish Wordbook')),
            t('div#search', [
                t('input#word|placeholder=Type a word to look up|autofocus=autofocus|autocomplete=off', '', {'input': function() {
                    var main = document.getElementById('main')
                        filtered = document.getElementById('filtered'),
                        result = document.getElementById('result');
                    filtered.innerHTML = '';
                    if (this.value) {
                        main.classList.remove('noresult');
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
                        var wordsToShow = [wordList[0]];
                        if (wordList[0] && wordList[0].form.slice(-1) == '1') for (var i = 1; i < wordList.length; i++) {
                            if (isNaN(wordList[i].form.slice(-1)) || wordList[i].form.slice(-1) == '1') break;
                            wordsToShow.push(wordList[i]);
                        }
                        if (wordList.length) {
                            filtered.firstChild.classList.add('selected');
                            showWord(wordsToShow);
                            document.getElementById('filtered').scrollTop = 0;
                        } else {
                            result.innerHTML = '';
                            main.classList.add('noresult');
                        }
                    } else document.getElementById('wrapper').classList.remove('on');
                }}),
                t('div#insertchars', [
                    t('span|title=Insert å', 'å', {'click': function() {
                        insertChar('å');
                    }}),
                    t('span|title=Insert ä', 'ä', {'click': function() {
                        insertChar('ä');
                    }}),
                    t('span|title=Insert ö', 'ö', {'click': function() {
                        insertChar('ö');
                    }})
                ]),
                t('span#clear|title=Clear search (esc)', '', {'click': function() {
                    clearSearch();
                }})
            ]),
            t('div#main', [
                t('ul#filtered'),
                t('div#result')
            ]),
            t('div#footer', [
                t('a#cclicense|rel=license|href=https://creativecommons.org/licenses/by-sa/4.0/|title=Creative Commons License BY-SA 4.0', ''),
                t('span', 'Quick Swedish Wordbook (2018) is based on <a xmlns:dct="http://purl.org/dc/terms/" href="https://spraakbanken.gu.se/resource/lexin" rel="dct:source">LEXIN Second Edition</a>')
            ])
        ])
    );
    document.getElementById('word').focus();
    document.getElementById('cclicense').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="5.5 -3.5 64 64"><path d="M37.441-3.5c8.951,0,16.572,3.125,22.857,9.372c3.008,3.009,5.295,6.448,6.857,10.314c1.561,3.867,2.344,7.971,2.344,12.314c0,4.381-0.773,8.486-2.314,12.313c-1.543,3.828-3.82,7.21-6.828,10.143c-3.123,3.085-6.666,5.448-10.629,7.086c-3.961,1.638-8.057,2.457-12.285,2.457s-8.276-0.808-12.143-2.429c-3.866-1.618-7.333-3.961-10.4-7.027c-3.067-3.066-5.4-6.524-7-10.372S5.5,32.767,5.5,28.5c0-4.229,0.809-8.295,2.428-12.2c1.619-3.905,3.972-7.4,7.057-10.486C21.08-0.394,28.565-3.5,37.441-3.5z M37.557,2.272c-7.314,0-13.467,2.553-18.458,7.657c-2.515,2.553-4.448,5.419-5.8,8.6c-1.354,3.181-2.029,6.505-2.029,9.972c0,3.429,0.675,6.734,2.029,9.913c1.353,3.183,3.285,6.021,5.8,8.516c2.514,2.496,5.351,4.399,8.515,5.715c3.161,1.314,6.476,1.971,9.943,1.971c3.428,0,6.75-0.665,9.973-1.999c3.219-1.335,6.121-3.257,8.713-5.771c4.99-4.876,7.484-10.99,7.484-18.344c0-3.543-0.648-6.895-1.943-10.057c-1.293-3.162-3.18-5.98-5.654-8.458C50.984,4.844,44.795,2.272,37.557,2.272z M37.156,23.187l-4.287,2.229c-0.458-0.951-1.019-1.619-1.685-2c-0.667-0.38-1.286-0.571-1.858-0.571c-2.856,0-4.286,1.885-4.286,5.657c0,1.714,0.362,3.084,1.085,4.113c0.724,1.029,1.791,1.544,3.201,1.544c1.867,0,3.181-0.915,3.944-2.743l3.942,2c-0.838,1.563-2,2.791-3.486,3.686c-1.484,0.896-3.123,1.343-4.914,1.343c-2.857,0-5.163-0.875-6.915-2.629c-1.752-1.752-2.628-4.19-2.628-7.313c0-3.048,0.886-5.466,2.657-7.257c1.771-1.79,4.009-2.686,6.715-2.686C32.604,18.558,35.441,20.101,37.156,23.187z M55.613,23.187l-4.229,2.229c-0.457-0.951-1.02-1.619-1.686-2c-0.668-0.38-1.307-0.571-1.914-0.571c-2.857,0-4.287,1.885-4.287,5.657c0,1.714,0.363,3.084,1.086,4.113c0.723,1.029,1.789,1.544,3.201,1.544c1.865,0,3.18-0.915,3.941-2.743l4,2c-0.875,1.563-2.057,2.791-3.541,3.686c-1.486,0.896-3.105,1.343-4.857,1.343c-2.896,0-5.209-0.875-6.941-2.629c-1.736-1.752-2.602-4.19-2.602-7.313c0-3.048,0.885-5.466,2.658-7.257c1.77-1.79,4.008-2.686,6.713-2.686C51.117,18.558,53.938,20.101,55.613,23.187z"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="5.5 -3.5 64 64"><path d="M37.443-3.5c8.988,0,16.57,3.085,22.742,9.257C66.393,11.967,69.5,19.548,69.5,28.5c0,8.991-3.049,16.476-9.145,22.456C53.879,57.319,46.242,60.5,37.443,60.5c-8.649,0-16.153-3.144-22.514-9.43C8.644,44.784,5.5,37.262,5.5,28.5c0-8.761,3.144-16.342,9.429-22.742C21.101-0.415,28.604-3.5,37.443-3.5z M37.557,2.272c-7.276,0-13.428,2.553-18.457,7.657c-5.22,5.334-7.829,11.525-7.829,18.572c0,7.086,2.59,13.22,7.77,18.398c5.181,5.182,11.352,7.771,18.514,7.771c7.123,0,13.334-2.607,18.629-7.828c5.029-4.838,7.543-10.952,7.543-18.343c0-7.276-2.553-13.465-7.656-18.571C50.967,4.824,44.795,2.272,37.557,2.272z M46.129,20.557v13.085h-3.656v15.542h-9.944V33.643h-3.656V20.557c0-0.572,0.2-1.057,0.599-1.457c0.401-0.399,0.887-0.6,1.457-0.6h13.144c0.533,0,1.01,0.2,1.428,0.6C45.918,19.5,46.129,19.986,46.129,20.557z M33.042,12.329c0-3.008,1.485-4.514,4.458-4.514s4.457,1.504,4.457,4.514c0,2.971-1.486,4.457-4.457,4.457S33.042,15.3,33.042,12.329z"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="5.5 -3.5 64 64"><path d="M37.443-3.5c8.951,0,16.531,3.105,22.742,9.315C66.393,11.987,69.5,19.548,69.5,28.5c0,8.954-3.049,16.457-9.145,22.514C53.918,57.338,46.279,60.5,37.443,60.5c-8.649,0-16.153-3.143-22.514-9.429C8.644,44.786,5.5,37.264,5.5,28.501c0-8.723,3.144-16.285,9.429-22.685C21.138-0.395,28.643-3.5,37.443-3.5z M37.557,2.272c-7.276,0-13.428,2.572-18.457,7.715c-5.22,5.296-7.829,11.467-7.829,18.513c0,7.125,2.59,13.257,7.77,18.4c5.181,5.182,11.352,7.771,18.514,7.771c7.123,0,13.334-2.609,18.629-7.828c5.029-4.876,7.543-10.99,7.543-18.343c0-7.313-2.553-13.485-7.656-18.513C51.004,4.842,44.832,2.272,37.557,2.272z M23.271,23.985c0.609-3.924,2.189-6.962,4.742-9.114c2.552-2.152,5.656-3.228,9.314-3.228c5.027,0,9.029,1.62,12,4.856c2.971,3.238,4.457,7.391,4.457,12.457c0,4.915-1.543,9-4.627,12.256c-3.088,3.256-7.086,4.886-12.002,4.886c-3.619,0-6.743-1.085-9.371-3.257c-2.629-2.172-4.209-5.257-4.743-9.257H31.1c0.19,3.886,2.533,5.829,7.029,5.829c2.246,0,4.057-0.972,5.428-2.914c1.373-1.942,2.059-4.534,2.059-7.771c0-3.391-0.629-5.971-1.885-7.743c-1.258-1.771-3.066-2.657-5.43-2.657c-4.268,0-6.667,1.885-7.2,5.656h2.343l-6.342,6.343l-6.343-6.343L23.271,23.985L23.271,23.985z"/></svg>';
    document.addEventListener('keydown', function(e) {
        var selected = document.getElementsByClassName('selected')[0],
            filtered = document.getElementById('filtered');
        switch (e.keyCode) {
            case 40: // Down
                e.preventDefault();
                if (selected.nextSibling) {
                    selected.classList.remove('selected');
                    selected.nextSibling.classList.add('selected');
                    if (selected.nextSibling.getBoundingClientRect().bottom - filtered.getBoundingClientRect().height - 80 >= 0) filtered.scrollTop = selected.nextSibling.offsetTop - filtered.getBoundingClientRect().height - selected.nextSibling.getBoundingClientRect().height - 7;
                    showWord(findWord(selected.nextSibling.innerHTML));
                }
                break;
            case 38: // Up
                e.preventDefault();
                if (selected.previousSibling) {
                    selected.classList.remove('selected');
                    selected.previousSibling.classList.add('selected');
                    if (selected.previousSibling.offsetTop - 80 <= filtered.scrollTop) filtered.scrollTop = selected.previousSibling.offsetTop - 80;
                    showWord(findWord(selected.previousSibling.innerHTML));
                }
                break;
            case 27: // Escape
                e.preventDefault();
                clearSearch();
                break;
        }
    })
})
