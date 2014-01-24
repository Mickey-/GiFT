var Gift = Gift || {};
Gift.App = Gift.App || {};
Gift.App.Hint = function(cfg) {
    this.cfg = {
        msg: '这是一个提示！',
        last: 1200,
        target: 'body'
    };
    $.extend(this.cfg, cfg);
    this.init();
};

Gift.App.Hint.prototype = {
    init: function() {
        this.dom();
    },

    dom: function() {
        $('<p class="x-hint" style="display: none;">' + this.cfg.msg + '</p>')
        .appendTo(this.cfg.target)
        .fadeIn()
        .delay(this.cfg.last)
        .fadeOut(function() {
            $(this).remove();
        });
    }
};