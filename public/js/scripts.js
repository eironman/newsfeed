$(function(){
    // Delete feed button
	$('.delete-feed').click(function() {
        if (confirm('Are you sure you want to delete it?')) {
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
});