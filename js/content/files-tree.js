(function() {
    function Tree() {
        this.nameSpace = $('.project_name').text().replace(/\s/g, '').replace(/\./g, '-');
        this.projectRef = $('#ref').val();
        this.version = this.projectRef.split('/')[1];
        this.assetsHost = (/daily/).test(this.projectRef) ? 'http://g.assets.daily.taobao.net' : 'http://g.tbcdn.cn';
        this.assetsType = '';
    }

    Tree.prototype = {
        ASSETS_TYPE: {
            ASSEMBLY: 'ASSEMBLY', // 覆盖发布
            OPERATION: 'OPERATION' // 不覆盖发布
        },
        html: {
            tree: '<td class="x-tree-copy"><a href="javascript:;" class="btn btn-tiny x-copy">复制CDN地址</a></div></td>',
            crumb: ''
        },
        init: function() {
            this.onMsg();
            this.getAssetsType();
        },
        dom: function() {
            $('.tree_commit').attr('colspan', '1').parent().append(this.html.tree);
        },
        event: function() {
            var self = this;
            $('#tree-slider').on('click', '.x-copy', function(ev) {
                var url = $(this).parents('tr').find('a:first').attr('href');
                var override = self.assetsType === self.ASSETS_TYPE.ASSEMBLY;
                url = url.replace('/tree/' + self.projectRef + '/build', override ? '' : '/' + self.version);
                url = url.replace('/blob/' + self.projectRef + '/build', override ? '' : '/' + self.version);
                url = self.assetsHost + url;
                chrome.runtime.sendMessage({name: 'copy cdn url', data: {url: url}}, function(response) {
                    console.log(response);
                });
            });
        },
        onMsg: function() {
            var self = this;
            chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
                switch (msg.name) {
                    case 'get assets type success':
                        self.assetsType = msg.data.assets_type;
                        self.dom();
                        self.event();
                        break;
                }
            });
        },
        getAssetsType: function() {
            var self = this;
            chrome.runtime.sendMessage({name: 'get assets type', data: {path: this.nameSpace}});
        }
    };

    (new Tree()).init();
    console.log('xGitLab done');
})();