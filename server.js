const express = require('express');
const app = express();
const path = require('path');
const request = require('request');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient
const feedsHelper = require('./feeds');
const moment = require('moment');
const mongodbUrl = 'mongodb://aaron:reigndesign@ds141454.mlab.com:41454/hacker-news-feed';
const feedsUrl = 'https://hn.algolia.com/api/v1/search_by_date?query=nodejs';

// Make static files available in views
app.use(express.static(path.join(__dirname, 'public')))

// Set views directory and template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Connect to db before anything else
let db;
MongoClient.connect(mongodbUrl, (err, database) => {
	if (err) {
		console.log('ERROR connecting to database: user: eironman, pass: r3ignd3sign. Do you have internet?');
	} else {

		db = database;

		// Run the server
		app.listen(3000, function() {
		  console.log('listening on 3000');
		})
	}
})

// Homepage
app.get('/', (req, res) => {
	// Get the latest feeds in db
	db.collection('nodejs-news').find().sort({'created_at': -1}).toArray(function(err, results) {
		for (let i=0; i<results.length; i++) {
			results[i]['created_at'] = moment(results[i]['created_at']).fromNow();
		}
		res.render('index', {'news': results});
	});
})

// Load the newest feeds from hacker news
app.get('/feeds', (req, res) => {

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
				db.collection('nodejs-deleted-news').find().toArray(function(err, deletedFeeds) {

					// Filter old and deleted feeds
					const feedsDocuments = feedsHelper.updateFeeds(deletedFeeds, newestFeed, feedsData['hits']);

					if (feedsDocuments.length == 0) {
						// No new feeds
						res.redirect('/');
					} else {
						// Store new feeds
						db.collection('nodejs-news').insert(feedsDocuments, (err, result) => {
							if (err){
								console.log(err);
								res.render('get-feed-error');
							} else {
								// Go to homepage
								res.redirect('/');
							}
						});
					}
				});
				
			} else {
				
				// Error
				res.render('get-feed-error');
			}
		});
	});
})


// Deletes a feed from the db
app.delete('/feeds/:id', (req, res) => {

	if (req.params.id == '') {
		res.json({ 'result': 'ko' });
	} else {
		// Connect to db and delete the feed
		const query = {'object_id': req.params.id};
		db.collection('nodejs-news').deleteOne(query, function(err, results) {
			if (err) {
				res.json({ 'result': 'ko' });
			} else {

				// Store the id deleted
				let deletedFeedId = {
					'id': parseInt(req.params.id, 10)
				}
				db.collection('nodejs-deleted-news').insertOne(deletedFeedId, (err, result) => {
					if (err){
						res.json({ 'result': 'ko' });
					} else {
						res.json({ 'result': 'ok' });
					}
				});
			}
		});
	}
})