var jsonp = (function(){
  var that = {};

  that.send = function(src, options) {
    var callback_name = options.callbackName || 'callback',
      on_success = options.onSuccess || function(){},
      on_timeout = options.onTimeout || function(){},
      timeout = options.timeout || 10; // sec

    var timeout_trigger = window.setTimeout(function(){
      window[callback_name] = function(){};
      on_timeout();
    }, timeout * 1000);

    window[callback_name] = function(data){
      window.clearTimeout(timeout_trigger);
      on_success(data);
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;

    document.getElementsByTagName('head')[0].appendChild(script);
  }

  return that;
})();


function getArticle(word) {
    jsonp.send('https://api.ne.se/search?q='+ word  +'&fq=type%3Aordbok+AND+subtype%3Asvensk&callback=handleStuff', {
        callbackName: 'handleStuff',
        onSuccess: function(json){
            console.log('success!', json);
            var ending = json.result.document[0].summary.split('ORDLED: ')[1].split('-').slice(-1)[0];
            document.body.innerHTML = ending == 'et' ? 'ett' : ending;
        },
        onTimeout: function(){
            console.log('timeout!');
        },
        timeout: 5
    });
}
