let nextPage = () => {
    window.location.replace('/game/next');
};
let prevPage = () => {
    window.location.replace('/game/prev');
};
$('#modal').on('show.bs.modal', function(event) {
    let button = $(event.relatedTarget);
    let recipient = button.data('whatever');
    let modal = $(this);
    let stakeButton = $('#modal #stakeButton');
    if (recipient === 'projectA') {
        stakeButton.data('project', 0);
    } else if (recipient === 'projectB') {
        stakeButton.data('project', 1);
    }
    modal.find('.modal-title').text('Stake str on  ' + recipient);
});
$('#bttn0').on('click', function(event) {
    if ($(this).hasClass('disabled')) {
        event.stopPropagation();
    } else {
        $('#modal').modal('show');
    }
});
$('#bttn1').on('click', function(event) {
    if ($(this).hasClass('disabled')) {
        event.stopPropagation();
    } else {
        $('#modal').modal('show');
    }
});
$('#stakeButton').click(() => {
    console.log($('#modal #stakeButton').data('project'));
    console.log(Number($('#stakeValue').val()));
    $.ajax({
        type: 'POST',
        url: '/twr',
        data: {
            project: $('#modal #stakeButton').data('project'), // either 0 or 1
            value: Number($('#stakeValue').val())
        },
        success: data => {
            console.log(data);
            $('#bttn0').addClass('disabled');
            $('#bttn1').addClass('disabled');
        }
    });
});
let enableToggleModal = () => {
    $('#bttn0').removeClass('disabled');
    $('#bttn1').removeClass('disabled');
};
