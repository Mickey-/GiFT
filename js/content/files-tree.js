(function() {
    function Tree() {
        this.nameSpace = location.pathname.match(/^\/([^\/]+\/[^\/]+)/)[1]; // sj/qn
        this.projectRef = location.pathname.match(/^\/(?:[^\/]+\/){3}([^\/]+\/[^\/]+)/)[1]; // daily/1.4.0
        this.version = this.projectRef.split('/')[1]; // 1.4.0
        this.assetsHost = (/daily/).test(this.projectRef) ? 'http://g.alicdn.daily.taobao.net' : 'http://g.alicdn.com';
        this.lastLocation = location.href;
        this.assetsType = '';

        this.debug = true;
        this.log(this);
    }

    Tree.prototype = {
        ASSETS_TYPE: {
            ASSEMBLY: 'ASSEMBLY', // 覆盖发布
            OPERATION: 'OPERATION' // 不覆盖发布
        },
        html: {
            tree: '<td class="x-tree-copy"><a href="javascript:;" class="btn btn-tiny x-copy">复制CDN地址</a><a class="simulate-checkbox x-checkbox" href="javascript:;"></a></td>',
            treeBatch: '<a href="javascript:;" class="btn btn-tiny x-copy-combo">复制拼接URL</a><a class="simulate-checkbox x-checkbox-all" href="javascript:;"></a>',
            crumb: ''
        },
        init: function() {
            this.onMsg();
            this.event();
        },
        dom: function() {
            $('.tree-item:first td:last').addClass('x-tree-copy').append(this.html.treeBatch);
            $('.tree_commit').attr('colspan', '1').parent().append(this.html.tree);
        },
        event: function() {
            var self = this;    
            $(document)
            .on('click', '.x-copy-combo', function(ev) {self.onComboCopy();})
            .on('click', '.x-copy', function(ev) {self.onSingleCopy($(this).parents('tr'));})
            .on('click', '.x-checkbox-all', function(ev) {
                $(this).toggleClass('simulate-checkbox-checked');
                isChecked = $(this).hasClass('simulate-checkbox-checked');
                $('.x-checkbox')[isChecked ? 'addClass' : 'removeClass']('simulate-checkbox-checked');
            })
            .on('click', '.x-checkbox', function(ev) {
                $(this).toggleClass('simulate-checkbox-checked');
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
            this.nameSpace = location.pathname.match(/^\/([^\/]+\/[^\/]+)/)[1];
            this.projectRef = location.pathname.match(/^\/(?:[^\/]+\/){3}([^\/]+\/[^\/]+)/)[1];
            this.version = this.projectRef.split('/')[1];
            this.assetsHost = (/daily/).test(this.projectRef) ? 'http://g.alicdn.daily.taobao.net' : 'http://g.alicdn.com';
        },
        
        onSingleCopy: function($row) {
            var url = this.urlBody() + this.urlTail($row);
            this.requestCopy(url);
        },

        onComboCopy: function() {
            var self = this; tails = [];
            $('.x-checkbox.simulate-checkbox-checked').parents('tr').each(function(i, row) {
                tails.push(self.urlTail($(row)));
            });
            self.requestCopy(this.urlBody() + '??' + tails.join(','));
        },

        requestCopy: function(url) {
            chrome.runtime.sendMessage({name: 'copy cdn url', data: {url: url}}, function(response) {
                new Gift.App.Hint({msg: response.result});
            });
        },

        // URL构成: host + group + project + version + tail
        urlBody: function() {
            var version = this.assetsType === this.ASSETS_TYPE.ASSEMBLY ? '/' : '/' + this.version + '/';
            return this.assetsHost + '/' + this.nameSpace + version;
        },
        urlTail: function($row) {
            var href = $row.find('a:first').attr('href');
            var dirtyReg = new RegExp('\\/' + this.nameSpace + '\\/(tree|blob)\\/' + this.projectRef + '\\/build\\/', 'g');
            return href.replace(dirtyReg, '');
        },

        tryActive: function() {
            if (!(/\/tree\/(daily|publish)\/.+\/build/).test(location.href)) {return;}
            this.getProjectInfo();
            this.getAssetsType();
            this.lastLocation = location.href;
        },

        log: function() {
            if (this.debug) {console.log.apply(console, arguments);}
        },
    };

    var tree = new Tree();
    tree.init();
    tree.tryActive();
})();