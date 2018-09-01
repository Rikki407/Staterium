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
            element_append = `<li>
                <div class="comment-main-level">
                    <!-- Avatar -->
                    <div class="comment-avatar"><img src="http://dummyimage.com/60" alt=""></div>
                    <!-- Contenedor del Comentario -->
                    <div class="comment-box">
                        <div class="comment-head">
                            <h6 class="comment-name by-author"><a href="#">User Name</a></h6>
                            <span class="posted-time">Posted on 10-FEB-2015 12:00</span>
                            <i class="fa fa-heart"></i>
                        </div>
                        <div class="comment-content">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit omnis animi et iure laudantium vitae, praesentium optio,
                            sapiente distinctio illo?
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

                <ul class="comments-list reply-list">

                </ul>
            </li>`;
            $(targetObject)
                .siblings('.comments-list.reply-list')
                .append(element_append);
        }
    }
});
