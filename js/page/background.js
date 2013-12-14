var privateToken = '';
chrome.storage.sync.get('privateToken', function(data) {
    privateToken = data.privateToken;
});
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    // console.log(arguments);
    switch (msg.name) {
        case 'get assets type':
            msg.data.private_token = privateToken;
            $.ajax({
                type: 'GET',
                url: 'http://gitlab.alibaba-inc.com/api/v3/project',
                data: msg.data,
                success: function(data) {
                    chrome.tabs.sendMessage(sender.tab.id, {name: 'get assets type success', data: data});
                },
                error: function(data) {
                    chrome.tabs.sendMessage(sender.tab.id, {name: 'get assets type failure', data: data});
                }
            });
            break;
        case 'copy cdn url':
            $('#x-clip').val(msg.data.url).select();
            document.execCommand('Copy');
            sendResponse({result: '复制成功'});
            break;
    }
});

chrome.webRequest.onCompleted.addListener(function(request) {
    // console.log(request);
    chrome.tabs.sendMessage(request.tabId, {name: 'file tree requested', data: request});
}, {
    urls: ['*://gitlab.alibaba-inc.com/*/refs/*/logs_tree/*'],
    types: ['xmlhttprequest']
});
