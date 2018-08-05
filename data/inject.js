const STAR_PATH = "M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"
const WATCH_PATH = "M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"
const NS = "http://www.w3.org/2000/svg";

function getRepo(repoName, cb) {
    let request = new content.XMLHttpRequest();
    request.open('GET', "https://api.github.com/repos" + repoName, true);

    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            cb(JSON.parse(this.response));
        }
    };
    request.send();
}

// name is star or eye
function createAnchor(name, text, count, url, d) {

    let a = document.createElement("a");
    a.setAttribute("class", "bubble-action");
    a.setAttribute("href", url);


    let svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "octicon octicon-" + name);
    svg.setAttribute("viewBox", "0 0 14 16");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");


    let path = document.createElementNS(NS, "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("d", d);

    svg.appendChild(path);


    let span = document.createElement("span");
    span.setAttribute("class", "Counter");
    span.appendChild(document.createTextNode(count));

    a.appendChild(svg);
    a.appendChild(document.createTextNode(" " + text + " "));
    a.append(span);

    return a;
}

// Template for button div
function createElement(repoName, stars, watchers) {
    let outerdiv = document.createElement("div");
    outerdiv.setAttribute("class", "bubble");
    let div = document.createElement("div");
    div.setAttribute("class", "bubble-actions");

    let url = "https://github.com/login?return_to=" + encodeURIComponent(repoName);

    let star_a = createAnchor("star", "Stars", stars, url, STAR_PATH);
    let watch_a = createAnchor("eye", "Watchers", watchers, url, WATCH_PATH);

    div.appendChild(star_a);
    div.appendChild(watch_a);

    outerdiv.appendChild(div);
    return outerdiv;
}

let mobileHeader = document.querySelector("div.reponav-wrapper");
let paths = window.location.pathname.split("/");

// If mobile site and on github repo
if (mobileHeader && paths.length >= 3) {
    let repoName = "/" + paths[1] + "/" + paths[2];
    getRepo(repoName, function(resp) {
        let stars = resp.stargazers_count;
        let watchers = resp.subscribers_count;

        console.log("github-buttons-mobile: stars:" + stars + " watchers:"+watchers);

        // If received valid response from GitHub API
        if (typeof stars !== "undefined" && typeof watchers !== "undefined") {
            let divButtons = document.querySelector("div.repo-buttons");
            let isLoggedIn = document.querySelector("a[href=\"/logout\"]");

            // If logged in, then just add watcher numbers
            if (isLoggedIn) {
                let watchersDiv = document.querySelector("a.bubble-action[href='#notification-settings']");

                let watchersSpan = document.createElement("span");
                watchersSpan.setAttribute("class", "Counter");
                watchersSpan.appendChild(document.createTextNode(watchers));

                watchersDiv.appendChild(watchersSpan);
            }
            // If not logged in, add buttons for both stars and watchers
            else {
                // Add new buttons after the .repository-meta
                let target = document.querySelector(".repository-meta");
                let newElement = createElement(repoName, stars, watchers);
                target.parentNode.insertBefore(newElement, target.nextSibling);
            }
        }
    });
}
