const queryBuilder = require('./query-builder');
const discovery = require('./watson-discovery-service');

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

  server.get('/', function(req, res){
    res.render('index', {});
  });

  server.get('/api/trending', (req, res, next) => {
    discovery.query(queryBuilder.build())
    .then(response => res.json(response))
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);

      next(error);
    });
  });

  return server;
}

module.exports = WatsonNewsServer;