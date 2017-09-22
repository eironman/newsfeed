const moment = require('moment');

let formatDate = (d) => {
	const feedDate = moment(d);
	const today = moment();
	const yesterday = moment().subtract(1, 'days');

	if (today.isSame(feedDate, 'd')) {
		// Same day
		return feedDate.format('HH:mm a');
	} else if (yesterday.isSame(feedDate, 'd')) {
		// Yesterday
		return  'Yesterday';
	} else {
		return feedDate.format('MMM DD');
	}
}

exports.formatDate = formatDate;