import React from 'react';
import PropTypes from 'prop-types';

const MAX_SIZE = 50;
const MIN_SIZE = 16;
let largest;
let ratio;
let computeSize;

const topicStory = item => item.aggregations[0].hits.hits[0];
const getSentiment = item => {
  switch (topicStory(item).docSentiment.type) {
  case 'negative': return '👎';
  case 'positive': return '👍';
  default: return '';
  }
};

const Cloud = props => {
  largest = props.data ?
    props.data.reduce((prev, cur) => (cur.matching_results > prev ? cur.matching_results : prev), 0) :
    0;
  ratio = MAX_SIZE / largest;
  computeSize = (value) => Math.max(MIN_SIZE, value * ratio);
  return (
    <div className="top-topics--cloud">
      {
        props.data ?
        props.data.map((item, index) =>
          <div className="top-topics--wrapper" key={`${index}-${item.key}`}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={topicStory(item).url}
              className="top-topics--word"
              title={item.matching_results}
              style={{
                fontSize: `${computeSize(item.matching_results)}px`,
                fontWeight: (computeSize(item.matching_results) < 13 ? 400 : null),
              }}
            >
              {item.key}
            </a> 
            <span
              style={{
                fontSize: `${computeSize(item.matching_results)}px`,
                fontWeight: (computeSize(item.matching_results) < 13 ? 400 : null),
              }}
            >
              {getSentiment(item)}
            </span>
          </div>) :
        []
      }
    </div>
  );
};

Cloud.propTypes = {
  data: PropTypes.array.isRequired,
};

module.exports = Cloud;
