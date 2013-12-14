$(function() {
    $('#use-start').on('click', function(ev) {
        var token = $('#private-token').val();
        if (!token) {return;}
        chrome.storage.sync.set({privateToken: token}, function() {
            console.log('privateToken saved');
        });
    });
});