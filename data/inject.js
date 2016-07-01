function getRepo(repoName, cb) {
    var request = new XMLHttpRequest();
    request.open('GET', "https://api.github.com/repos/" + repoName, true);

    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            cb(JSON.parse(this.response));
        }
    };
    request.send();
}

// Template for button div
function getHTML(repoName, stars, watchers) {
    return  `
<div class="btn-group repo-buttons">

    <form accept-charset="UTF-8" action="${repoName}/star" class="btn" method="post"><div style="margin:0;padding:0;display:inline"><input name="utf8" value="✓" type="hidden"><input name="authenticity_token" type="hidden"></div>      <button type="submit" value="Star">
            <svg aria-hidden="true" class="octicon octicon-star" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z"></path></svg>
            Star
            <span class="count">(${stars})</span>
          </button>
    </form>

    <a href="#notification-settings" class="btn">
          <svg aria-hidden="true" class="octicon octicon-eye" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path></svg> Watch
            <span class="count">(${watchers})</span>
        </a>

</div>`;
}

var header = document.querySelector("header.nav-bar");
var paths = window.location.pathname.split("/");

// If mobile site and on github repo
if (header && paths.length >= 3) {
    var repoName = paths[1] + "/" + paths[2];

    getRepo(repoName, function(resp) {
        var stars = resp.stargazers_count;
        var watchers = resp.subscribers_count;

        // If received valid response from GitHub API
        if (typeof stars !== "undefined" && typeof watchers !== "undefined") {
            var divButtons = document.querySelector("div.repo-buttons");
            // If logged in, then just add watcher numbers
            if (divButtons) {
                var watchersDiv = divButtons.querySelector("a[href='#notification-settings']");
                watchersDiv.innerHTML = watchersDiv.innerHTML.trim() + `<span class="count">(${watchers})</span>`;
            }
            // If not logged in, add buttons for both stars and watchers
            else {
                header.innerHTML += getHTML(repoName, stars, watchers);
            }
        }
    });
}


