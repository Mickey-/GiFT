var privateToken = '';
chrome.storage.sync.get('privateToken', function(data) {
    privateToken = data.privateToken;
});
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    console.log(arguments);
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
                error: function() {
                    console.log('get assets type fail');
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