const express = require('express');
const app = express();
const path = require('path');
const mongodb = require('mongodb');
const mongoClient = require('mongodb').MongoClient
const feedsHelper = require('./feeds');
const moment = require('moment');
const mongodbUrl = 'mongodb://aaron:reigndesign@ds141454.mlab.com:41454/hacker-news-feed';
const cronJob = require('cron').CronJob;

// Make static files available in views
app.use(express.static(path.join(__dirname, 'public')))

// Set views directory and template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Connect to db before anything else
let db;
mongoClient.connect(mongodbUrl, (err, database) => {

	if (err) {
		console.log('[ERROR] connecting to database: user: eironman, pass: r3ignd3sign. Do you have internet?');
	} else {

		// First feed load
		db = database;
		feedsHelper.updateFeeds(db);
		
		// Job to get feeds every hour
		new cronJob('59 59 * * * *', function() {
			feedsHelper.updateFeeds(db);
		}, null, true);

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


// Deletes a feed from the db
app.delete('/feeds/:id', (req, res) => {

	if (req.params.id == '') {
		res.json({'result': 'ko'});
	} else {
		// Connect to db and delete the feed
		const query = {'object_id': req.params.id};
		db.collection('nodejs-news').deleteOne(query, function(err, results) {
			if (err) {
				res.json({'result': 'ko'});
			} else {

				// Store the id deleted
				let deletedFeedId = {
					'id': parseInt(req.params.id, 10)
				}
				db.collection('nodejs-deleted-news').insertOne(deletedFeedId, (err, result) => {
					if (err){
						res.json({'result': 'ko'});
					} else {
						res.json({'result': 'ok'});
					}
				});
			}
		});
	}
})