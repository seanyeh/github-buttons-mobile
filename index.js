var self = require("sdk/self");

var pageMod = require("sdk/page-mod");

pageMod.PageMod({
    include: "*.github.com",
    contentScriptFile: self.data.url("inject.js")
});
