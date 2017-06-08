require('isomorphic-fetch');
const queryBuilder = require('./query-builder');
const discovery = require('./watson-discovery-service');
const RSS = require('rss');
const utils = require('../src/utils');
const { parseData, topicStory } = utils;

const WatsonNewsServer = new Promise((resolve, reject) => {
  discovery.getEnvironments({})
    .then(response => {
      const environmentId = response.environments
                                    .find(environment => environment.read_only == true)
                                    .environment_id;
      queryBuilder.setEnvironmentId(environmentId);
      return discovery.getCollections({ environment_id: environmentId });
    })
    .then(response => {
      const collectionId = response.collections[0].collection_id;
      queryBuilder.setCollectionId(collectionId);
      resolve(createServer());
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      reject(error);
    });
});

function createServer() {
  const server = require('./express');

  server.get('/', function(req, res) {
    res.render('index', {});
  });

  server.get('/api/trending', searchDiscovery);
  server.get('/api/trending/:category', searchDiscovery);

  server.get('/feed', generateFeed);
  server.get('/feed/:category', generateFeed);

  server.get('/:category', function(req, res) {
    res.render('index', { category: req.params.category });
  });

  return server;
}

const searchDiscovery = (req, res, next) => {
  const { category } = req.params;

  discovery.query(queryBuilder.build({
    filter: category ? `taxonomy.label:"${category}"` : ''
  }))
  .then(response => res.json(response))
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error(error);

    next(error);
  });
};

const generateFeed =  (req, res, next) => {
  const { category } = req.params;
  const feed = new RSS({
    title: 'Watson News Trending Topics',
    description: 'RSS feed for Trending Topics found using Watson Discovery Service'
  });

  fetch(`http://localhost:${process.env.PORT}/api/trending/${category ? category : ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  .then((response) => {
    if (response.ok) {
      response.json()
        .then((json) => {
          const { topics } = parseData(json);
          topics.forEach(item => {
            const story = topicStory(item);
            const categories = story.enrichedTitle.taxonomy.reduce((result, categories) =>
              result.concat(categories.label.split('/').slice(1)), []);
            feed.item({
              guid: story.id,
              title: item.key,
              url: story.url,
              description: story.enrichedTitle.text,
              author: story.author,
              categories
            });
          });

          res.set('Content-Type', 'text/xml').send(feed.xml());
        })
        .catch(error => next(error));
    } else {
      response.json()
      .then(error => next(error))
      .catch(errorMessage => next(errorMessage));
    }
  });
};

module.exports = WatsonNewsServer;