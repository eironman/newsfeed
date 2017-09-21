$(function(){
    
    // Load feeds
    $('.load-feeds').click(function() {
        $(this).addClass('disabled');
        $('.loader').removeClass('hide');
    });

    // Delete feed button
	$('.delete-feed').click(function() {
        if (confirm('Are you sure you want to delete it?'))
        {
            const feedId = $(this).data('feed-id');
            $.ajax({
                method: 'DELETE',
                url   : 'feeds/' + feedId
            })
            .done(function(response) {
                if (response['result'] == 'ok') {
                    $("#feed-row-" + feedId).remove();
                } else {
                    alert('Oops! Something went wrong')
                }
            })
            .fail(function() {
                alert('Oops! Something went wrong')
            });
        }
	});

    // Init timer
    startTimer();
});

// Formats a number to have two digits
function padTime(i) {
    if (i<10) {
        i = '0' + i;
    }
    return i;
}

function checkTime(timeA, timeB) {

    // If the hour has passed, reload the feeds
    let pendingTime = new Date(timeB - timeA);
    if ((timeB - timeA) == 0) {
        window.location = '/feeds'
        return;
    }
    
    $("#reload-time").html(padTime(pendingTime.getMinutes()) + ':' + padTime(pendingTime.getSeconds()));

    // Timeout to keep track of time
    setTimeout(
        function(){
            timeB.setSeconds(timeB.getSeconds() - 1);
            checkTime(timeA, timeB);
        }, 1000
    )
}

// Initiates the timer
function startTimer()
{
    let timeA = new Date();
    let timeB = new Date();
    timeB.setSeconds(timeB.getSeconds() + 3599);
    checkTime(timeA, timeB);
}
