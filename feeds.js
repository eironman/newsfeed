const request = require('request');
const feedsUrl = 'https://hn.algolia.com/api/v1/search_by_date?query=nodejs';

// Filters feeds: removes old feeds or without title
let filterFeeds = (deletedFeeds, newestFeed, feedsData) => {
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
			// Feed ok
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

// Stores the latest feeds
let updateFeeds = (db) => {

	console.log('[START] Updating feeds')

	// Get the newest feed in db
	db.collection('nodejs-news').find().sort({'created_at': -1}).limit(1).toArray(function(err, result) {

		newestFeed = [];
		if (result.length !== 0) {
			newestFeed = result[0];
		}

		// Get the feeds from hacker news
		request(feedsUrl, function(error, response, body) {
					
			if (!error && response.statusCode == 200) {
				
				feedsData = JSON.parse(response.body)

				// Get deleted feeds
				db.collection('nodejs-deleted-news').find().toArray(function(error, deletedFeeds) {

					// Filter old and deleted feeds
					const feedsDocuments = filterFeeds(deletedFeeds, newestFeed, feedsData['hits']);

					if (feedsDocuments.length > 0) {
						
						// Store new feeds
						db.collection('nodejs-news').insert(feedsDocuments, (error, result) => {
							if (error) {
								console.log(error);
								console.log('[ERROR] Updating feeds - Could not store in db')
							} else {
								console.log('[END] Updating feeds completed')
							}
						});
					} else {
						console.log('[END] Updating feeds completed - No feeds to save')
					}
				});
				
			} else {
				console.log('[ERROR] Updating feeds - No connection to hacker news')
				console.log(error)
			}
		});
	});
}

exports.filterFeeds = filterFeeds
exports.updateFeeds = updateFeeds