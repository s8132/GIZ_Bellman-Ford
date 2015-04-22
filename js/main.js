$(document).ready(function(){

    $('#container').load('pages/dot_lang.html');

    $('body').on('click', '#restartBtnAuto', function(event){
        event.preventDefault();
        $('#container').load('pages/dot_lang.html');
    });
});

var restartWithValue = function(value){
    $('#container').load('pages/dot_lang.html', function(){
        $('#source').val(value);
    });
};