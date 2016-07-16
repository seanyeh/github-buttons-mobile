// jsonToDom from: https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/DOM_Building_and_HTML_Insertion
jsonToDOM.namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
    xmlns: "http://www.w3.org/2000/svg"
};
jsonToDOM.defaultNamespace = jsonToDOM.namespaces.html;
function jsonToDOM(jsonTemplate, doc, nodes) {
    function namespace(name) {
        var reElemNameParts = /^(?:(.*):)?(.*)$/.exec(name);
        return { namespace: jsonToDOM.namespaces[reElemNameParts[1]], shortName: reElemNameParts[2] };
    }

    // Note that 'elemNameOrArray' is: either the full element name (eg. [html:]div) or an array of elements in JSON notation
    function tag(elemNameOrArray, elemAttr) {
        // Array of elements?  Parse each one...
        if (Array.isArray(elemNameOrArray)) {
            var frag = doc.createDocumentFragment();
            Array.forEach(arguments, function(thisElem) {
                frag.appendChild(tag.apply(null, thisElem));
            });
            return frag;
        }

        // Single element? Parse element namespace prefix (if none exists, default to defaultNamespace), and create element
        var elemNs = namespace(elemNameOrArray);
        var elem = doc.createElementNS(elemNs.namespace || jsonToDOM.defaultNamespace, elemNs.shortName);

        // Set element's attributes and/or callback functions (eg. onclick)
        for (var key in elemAttr) {
            var val = elemAttr[key];
            if (nodes && key === "key") {
                nodes[val] = elem;
                continue;
            }

            var attrNs = namespace(key);
            if (typeof val === "function") {
                // Special case for function attributes; don't just add them as 'on...' attributes, but as events, using addEventListener
                elem.addEventListener(key.replace(/^on/, ""), val, false);
            }
            else {
                // Note that the default namespace for XML attributes is, and should be, blank (ie. they're not in any namespace)
                elem.setAttributeNS(attrNs.namespace || "", attrNs.shortName, val);
            }
        }

        // Create and append this element's children
        var childElems = Array.slice(arguments, 2);
        childElems.forEach(function(childElem) {
            if (childElem !== null) {
                elem.appendChild(
                    childElem instanceof doc.defaultView.Node ? childElem :
                        Array.isArray(childElem) ? tag.apply(null, childElem) :
                            doc.createTextNode(childElem));
            }
        });

        return elem;
    }

    return tag.apply(null, jsonTemplate);
}


function getRepo(repoName, cb) {
    var request = new XMLHttpRequest();
    request.open('GET', "https://api.github.com/repos" + repoName, true);

    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            cb(JSON.parse(this.response));
        }
    };
    request.send();
}

// Template for button div
function createElement(repoName, stars, watchers) {
    var json = [
        "div", {class: "btn-group repo-buttons"},
            ["a", {
                href: "https://github.com/login?return_to=" + encodeURIComponent(repoName),
                class: "btn"
            },
                ["xmlns:svg", {
                    "aria-hidden": "true",
                    class: "octicon octicon-star",
                    height: "16",
                    version: "1.1",
                    viewBox: "0 0 14 16",
                    width: "14"
                },
                    ["xmlns:path", {
                        d: "M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z"
                    }]
                ],
                " Star",
                ["span", {
                    class: "count"
                },
                    "(" + stars + ")"
                ]
            ],

            ["a", {
                href: "https://github.com/login?return_to=" + encodeURIComponent(repoName),
                class: "btn"
            },
                ["xmlns:svg", {
                    "aria-hidden": "true",
                    class: "octicon octicon-eye",
                    height: "16",
                    version: "1.1",
                    viewBox: "0 0 16 16",
                    width: "16"
                },
                    ["xmlns:path", {
                        d: "M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"
                    }]
                ],
                " Watch",
                ["span", {
                    class: "count"
                },
                    "(" + watchers + ")"
                ]
            ]
    ];

    return jsonToDOM(json, document, {});
}

var header = document.querySelector("header.nav-bar");
var paths = window.location.pathname.split("/");

// If mobile site and on github repo
if (header && paths.length >= 3) {
    var repoName = "/" + paths[1] + "/" + paths[2];
    getRepo(repoName, function(resp) {
        var stars = resp.stargazers_count;
        var watchers = resp.subscribers_count;

        // If received valid response from GitHub API
        if (typeof stars !== "undefined" && typeof watchers !== "undefined") {
            var divButtons = document.querySelector("div.repo-buttons");
            var isLoggedIn = document.querySelector("a[href=\"/logout\"]");
            // If logged in, then just add watcher numbers
            if (isLoggedIn) {
                var watchersDiv = divButtons.querySelector("a[href='#notification-settings']");
                var watchersSpan = jsonToDOM(["span", {class: "count"}, "(" + watchers + ")"], document, {});
                watchersDiv.appendChild(watchersSpan);
            }
            // If not logged in, add buttons for both stars and watchers
            else {
                // Add new buttons after the "#js-flash-container" div
                var target = document.querySelector("#js-flash-container");
                var newElement = createElement(repoName, stars, watchers);
                target.parentNode.insertBefore(newElement, target.nextSibling);
            }
        }
    });
}
