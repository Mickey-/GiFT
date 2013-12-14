(function() {
    function Tree() {
        this.nameSpace = $('.project_name').text().replace(/\s/g, '').replace(/\./g, '-');
        this.projectRef = $('#ref').val();
        this.version = this.projectRef.split('/')[1];
        this.assetsHost = (/daily/).test(this.projectRef) ? 'http://g.assets.daily.taobao.net' : 'http://g.tbcdn.cn';
        this.lastLocation = location.href;
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
            this.event();
        },
        dom: function() {
            $('.tree_commit').attr('colspan', '1').parent().append(this.html.tree);
        },
        event: function() {
            var self = this;    
            $(document).on('click', '.x-copy', function(ev) {
                var url = $(this).parents('tr').find('a:first   ').attr('href');
                var override = self.assetsType === self.ASSETS_TYPE.ASSEMBLY;
                url = url.replace('/tree/' + self.projectRef + '/build', override ? '' : '/' + self.version);
                url = url.replace('/blob/' + self.projectRef + '/build', override ? '' : '/' + self.version);
                url = self.assetsHost + url;
                chrome.runtime.sendMessage({name: 'copy cdn url', data: {url: url}}, function(response) {
                    new Gift.App.Hint({msg: response.result});
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
                        break;
                    case 'get assets type failure':
                        if (msg.data.statusText === 'Unauthorized') {
                            new Gift.App.Hint({msg: '亲还没有添加Private token哦'});
                        } else {
                            new Gift.App.Hint({msg: msg.data.responseJSON.message});
                        }
                        break;
                    case 'file tree requested':
                        // console.log(msg.data);
                        // console.log(location.href);
                        // console.log(self.lastLocation);
                        if (location.href !== self.lastLocation) {
                            self.tryActive();
                        }
                        break;
                }
            });
        },
        getAssetsType: function() {
            var self = this;
            chrome.runtime.sendMessage({name: 'get assets type', data: {path: this.nameSpace}});
        },
        getProjectInfo: function() {
            this.nameSpace = $('.project_name').text().replace(/\s/g, '').replace(/\./g, '-');
            this.projectRef = $('#ref').val();
            this.version = this.projectRef.split('/')[1];
            this.assetsHost = (/daily/).test(this.projectRef) ? 'http://g.assets.daily.taobao.net' : 'http://g.tbcdn.cn';
        },
        tryActive: function() {
            if (!(/\/tree\/(daily|publish)\/.+\/build/).test(location.href)) {return;}
            this.getProjectInfo();
            this.getAssetsType();
            this.lastLocation = location.href;
        }
    };

    var tree = new Tree();
    tree.init();
    tree.tryActive();
})();