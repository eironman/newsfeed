// Filters feeds: removes old feeds or without title
let updateFeeds = (deletedFeeds, newestFeed, feedsData) => {
	let title, url;
	let feedsDocuments = [];
	let newestFeedDate = null;
	let feedDate = null;
	let isDeleted;
	
	if (newestFeed.length !== 0) {
		newestFeedDate = new Date(newestFeed['created_at']);
	}
	
	for (let i=0; i<feedsData.length; i++) {

		// Check if the feed was already deleted
		isDeleted = false;
		for (let j=0; j<deletedFeeds.length; j++) {
			if (deletedFeeds[j]['id'] == feedsData[i]['objectID']) {
				isDeleted = true;
				break;
			}
		}
		if (isDeleted) {
			continue;
		}

		// Check if this feed is newer than the newest feed stored in db
		feedDate = new Date(feedsData[i]['created_at']);
		if (newestFeedDate !== null && (feedDate.getTime() <= newestFeedDate.getTime())) {
			continue;
		}

		title = null;
		url = null;

		// Feed title
		if (feedsData[i]['story_title'] != null) {
			title = feedsData[i]['story_title'];
		} else if (feedsData[i]['title'] != null) {
			title = feedsData[i]['title'];
		}

		// Feed url
		if (feedsData[i]['story_url'] != null) {
			url = feedsData[i]['story_url'];
		} else if (feedsData[i]['url'] != null) {
			url = feedsData[i]['url'];
		}

		if (title !== null) {
			feedsDocuments.push({
				'created_at': feedsData[i]['created_at'],
				'title'		: title,
				'author'	: feedsData[i]['author'],
				'url'		: url,
				'object_id' : feedsData[i]['objectID']
			});
		}
	}

	return feedsDocuments;
}

exports.updateFeeds = updateFeeds