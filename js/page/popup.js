$(function() {
    $('#use-start').on('click', function(ev) {
        var token = $('#private-token').val();
        if (!token) {return;}
        chrome.storage.sync.set({privateToken: token}, function() {
            new Gift.App.Hint({msg: '添加成功', target: '.user-form'});
            chrome.runtime.getBackgroundPage(function(bgWin) {
                bgWin.location.reload();
            });
        });
    });
});