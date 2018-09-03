$.ajax({
    type: 'GET',
    url: '/comment/5b8da333d10eea0014c43f8c',

    success: data => {
        console.log(JSON.parse(data));
        printTree(JSON.parse(data), '/');
    }
});
function printTree(people, slug) {
    for (var i = 0; i < people.length; i++) {
        console.log(people[i].author + '/');
        let element_append = `<li>
        <div class="comment-main-level">
            <!-- Avatar -->
            <div class="comment-avatar"><img src="http://dummyimage.com/60" alt=""></div>
            <!-- Contenedor del Comentario -->
            <div class="comment-box">
                <div class="comment-head">
                    <h6 class="comment-name by-author"><a href="#">${
                        people[i].author
                    }</a></h6>
                    <span class="posted-time">Posted on 10-FEB-2015 12:00</span>
                    <i class="fa fa-heart"></i>
                </div>
                <div class="comment-content">
                    ${people[i].content}
                    <div class="comment-open">
                        <a class="btn-reply">
                            <i class="fa fa-reply"></i>
                        </a>
                    </div>
                </div>
                <div class="comment-footer">
                    <div class="comment-form">
                        <textarea class="form-control" name="" id=""></textarea>
                        <div class="pull-right send-button">
                            <a class="btn-send">send</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <ul class="comments-list reply-list" id="${people[i].commentId}">
    
        </ul>
    </li>`;
        let appendToId =
            people[i].parentId === undefined
                ? '#comments-list'
                : `#${people[i].parentId}`;
        $(appendToId).append(element_append);
        console.log('append to id :', appendToId);

        if (people[i].children.length) {
            printTree(people[i].children, people[i].name + '/');
        }
    }
    console.log($('#comments-list'));
}
$(document).on('click', '.btn-reply', function(eve) {
    eve.preventDefault();
    $(this)
        .parent()
        .parent()
        .siblings('.comment-footer')
        .slideToggle();
    eve.stopImmediatePropagation();
    console.log($(this));
});

$(document).on('click', '.btn-send', function(eve) {
    var targetObject = $(this)
        .parent()
        .parent()
        .parent()
        .parent()
        .parent();
    console.log(targetObject);

    var reply_text = $(this)
        .parent()
        .siblings('textarea')
        .val();

    if ($.trim(reply_text) == ' ' || $.trim(reply_text) == '') {
        alert('insert comment');
    } else {
        if ($(targetObject).hasClass('comment-main-level')) {
            $.ajax({
                type: 'POST',
                url: '/comment',
                data: {
                    content: reply_text,
                    author: 'Saurabh',
                    parentId: $(targetObject)
                        .siblings('.comments-list.reply-list')
                        .attr('id')
                },
                success: data => {
                    if (typeof data.redirect === 'string')
                        window.location = data.redirect;
                }
            });
            console.log(
                'HERE' +
                    $(targetObject)
                        .siblings('.comments-list.reply-list')
                        .attr('id')
            );
        }
    }
});
