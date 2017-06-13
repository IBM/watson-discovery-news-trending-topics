import queryBuilder from './query-builder';
import moment from 'moment';

describe('Query builder', () => {
  beforeEach(() => {
    queryBuilder.setCollectionId('collection');
    queryBuilder.setEnvironmentId('environment');
  });

  test('returns params for discovery service when opts are not passed', () => {
    expect(queryBuilder.build()).toEqual({
      environment_id: 'environment',
      collection_id: 'collection',
      return: 'enrichedTitle.entities.text',
      aggregations: [
        'term(enrichedTitle.entities.text,count:20).top_hits(1)'
      ],
      filter: `blekko.chrondate>${moment().subtract(24,'h').unix()},blekko.hostrank>300`
    });
  });
});
