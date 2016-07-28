$(function() {
    $('pre').addClass('prettyprint linenums'); //添加Google code Hight需要的class

    window.disqus_shortname = 'http-www-carlen-site'; // required: replace example with your forum shortname
    $.getScript('http://' + disqus_shortname + '.disqus.com/embed.js');

    $('.entry a').each(function(index,element){
        var href = $(this).attr('href');
        if(href){
            if(href.indexOf('#') == 0){
            }else if ( href.indexOf('/') == 0 || href.toLowerCase().indexOf('carlen.site')>-1 ){
            }else if ($(element).has('img').length){
            }else{
                $(this).attr('target','_blank');
                $(this).addClass('external');
            }
        }
    });

    $.getScript('/js/prettify/prettify.js',function(){
        prettyPrint();
    });
});
