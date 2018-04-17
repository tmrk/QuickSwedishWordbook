var xhr = new XMLHttpRequest();
xhr.open("GET", "http://api.ne.se/search?q=moln&fq=type%3Aordbok+AND+subtype%3Asvensk", true);
xhr.onload = function (e) {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
			var res = xhr.responseText;
      document.write(JSON.parse(res).natural);
    } else {
      console.error(xhr.statusText);
    }
  }
};
xhr.onerror = function (e) {
  console.error(xhr.statusText);
};
xhr.send(null);
