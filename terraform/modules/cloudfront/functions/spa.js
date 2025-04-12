function handler(event) {
    var request = event.request;
    var uri = request.uri;
  
    // 静的ファイル（.js, .css, .svg など）はそのまま
    if (uri.match(/\.[a-zA-Z0-9]+$/)) {
      return request;
    }
  
    // それ以外は全て index.html にリライト
    request.uri = "/index.html";
    return request;
  }