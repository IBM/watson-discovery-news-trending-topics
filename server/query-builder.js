const moment = require('moment');
const aggregations = [
  'term(enrichedTitle.entities.text,count:20).top_hits(1)'
];

module.exports = {
  aggregations,
  setEnvironmentId(environmentId) {
    this.environment_id = environmentId;
  },
  setCollectionId(collectionId) {
    this.collection_id = collectionId;
  },
  build(queryOpts) {
    const params = Object.assign({
      environment_id: this.environment_id,
      collection_id: this.collection_id,
      filter: `blekko.chrondate>${moment().subtract(24,'h').unix()},blekko.hostrank>300`,
      return: 'enrichedTitle.entities.text',
      aggregations
    }, queryOpts);

    return params;
  },
};
