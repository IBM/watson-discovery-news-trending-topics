import 'isomorphic-fetch';
import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'watson-react-components';
import Cloud from './Cloud';
import Query from './Query';
import queryBuilder from '../server/query-builder';
import { parseData } from './utils';
import categories from './taxonomy';

class Main extends React.Component {

  constructor(...props) {
    super(...props);

    this.state = {
      error: null,
      data: null,
      loading: false
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    this.setState({
      loading: true,
    });

    const { category } = this.props;

    fetch(`/api/trending/${category ? category : ''}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      if (response.ok) {
        response.json()
          .then((json) => {
            this.setState({ data: parseData(json), loading: false });
          });
      } else {
        response.json()
        .then((error) => this.setState({ error, loading: false }))
        .catch((errorMessage) => {
          // eslint-disable-next-line no-console
          console.error(errorMessage);
          this.setState({
            error: { error: 'There was a problem with the request, please try again' },
            loading: false,
          });
        });
      }
    });
  }

  render() {
    const { loading, data } = this.state;
    const { category } = this.props;
    const filter = category ? `taxonomy.label:"${category}"` : '';

    return (
      <div className="results">
        <div className="_container">
          <div className="row">
            <div className="top-stories widget">
              <div className="widget--header">
                <h1 className="base--h2 widget--header-title">
                  Trending Topics in News {category && `for ${category.toUpperCase()}`}
                  <a href={`/feed/${category ? category : ''}`} className="rss-feed--icon">
                    <img src="/images/feed-icon.png" />
                  </a>
                </h1>
                <div className="widget--header-spacer" />
              </div>
              {!data || loading ? (
                <div className="results">
                  <div className="loader--container">
                    <Icon type="loader" size="large" />
                  </div>
                </div>
              ) : (
                <div className="top-stories--list">
                  <Cloud data={data.topics} />
                  <Query
                    title="Query to the Discovery Service"
                    query={queryBuilder.build({ filter })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="_container">
          <div className="row">
            <div className="top-stories widget">
              <h2>Trending Topics in Other Categories</h2>
              <div>You can also view trending topics for certain categories below and subscribe to its RSS feed:</div>
              <ul>
                {categories.map(category => 
                  <li key={category}>
                    <a href={category} target="_blank" rel="noopener noreferrer">{category.toUpperCase().substring(1)}</a>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Main.propTypes = {
  category: PropTypes.string
};

module.exports = Main;