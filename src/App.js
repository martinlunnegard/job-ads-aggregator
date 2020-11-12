import React, { useState } from 'react';
import { 
  API_URL_1,
  API_URL_2, 
  API_KEY_1,
  API_KEY_2, 
  API_ID
} from '../src/utils/api';
import axios from 'axios';
import { orderBy } from 'lodash';
import './App.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState(''); 
  const [results, setResults] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault(); 
    if(!searchTerm) return;

    const options = {
      headers: {
        'accept': 'application/json',
        'api-key': API_KEY_1
      }
    }

    const results1 = axios.get(`${API_URL_1}/search?q=${searchTerm}`, options);
    const results2 = axios.get(`${API_URL_2}?app_id=${API_ID}&app_key=${API_KEY_2}&what=${searchTerm}&content-type=application/jsons`);

    Promise.all([results1, results2]).then(res => {
      if(res) {
        let formatted = formatResults(res); 
        setResults(formatted);
      }
    })
    setSearchTerm('');
  }

  // Format API results in a unified way before pushing into State
  const formatResults = (res) => {
    let formattedData = [];

    res.map(item => {
      if(item.data && item.data.hits) {
        item.data.hits.map(arrayItem => {
          let arrayObject = {
            id: arrayItem.id,
            created: arrayItem.publication_date,
            company: arrayItem.employer.name,
            company_url: arrayItem.application_details.url,
            location: arrayItem.workplace_address.municipality,
            job_title: arrayItem.headline,
            job_description: arrayItem.description.text,
            apply_url: arrayItem.webpage_url
          }
          return formattedData.push(arrayObject);
        })
      }
      if(item.data && item.data.results) {
        item.data.results.map(arrayItem => {
          let arrayObject = {
            id: arrayItem.id,
            created: arrayItem.created,
            company: arrayItem.company.display_name,
            company_url: arrayItem.redirect_url,
            location: arrayItem.location.display_name,
            job_title: arrayItem.title,
            job_description: arrayItem.description,
            apply_url: arrayItem.redirect_url
          }
          return formattedData.push(arrayObject);
        })
        return formattedData;
      }
      return formattedData;
    })
    return formattedData;
  }


  // Sort jobs ads based on publication date 
  const sortData = (results) => {
    let sortedList = orderBy(results, ['created'], ['desc']);
    return sortedList; 
  }

  // Strip HTML Tags from text
  const strippTags = (originalString) => {
    let strippedString = originalString.replace(/(<([^>]+)>)/gi, "");
    return strippedString;
  }

  // Render Method
  const renderResults = (results) => {
    const sortedList = sortData(results); 
    
    return (
      Object.keys(sortedList).map(key => {
        const item = sortedList[key];
         return(
           <li className="item-container" key={item.id}>
            <div className="item-container__title">{strippTags(item.job_title)}</div>
            <div className="item-container__category">
              <span className="item-container__category__label">Published:</span> {new Date (item.created).toLocaleDateString('se-SE')}
            </div>
            <div className="item-container__category">
              <span className="item-container__category__label">Company:</span> {item.company}
            </div>
            <div className="item-container__category">
              <span className="item-container__category__label">Company url:</span> <a target="_blank" rel="noopener noreferrer" href={item.company_url}>{item.company_url}</a>
            </div>
            <div className="item-container__category">
              <span className="item-container__category__label">Location:</span> {item.location} 
            </div>
            <div className="item-container__category">
              <span className="item-container__category__label">Job description:</span> {strippTags(item.job_description)}</div>
            <div className="item-container__category">
              <span className="item-container__category__label">Apply url:</span> <a target="_blank" rel="noopener noreferrer" href={item.apply_url}>{item.apply_url}</a>
            </div>
          </li>
         ) 
      })
    )
  }

  return (
    <div className="App">
      <div className="page-grid">
        <h1 className="headline">Job ads aggregator</h1>
        <section className="search">
          <form onSubmit={handleSubmit} className="search-form">
            <input 
              type="text" 
              className="search-input"
              placeholder="Enter search term"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input 
              type="submit" 
              className="submit-button"
              value="Search"
            />
          </form>
        </section>
        <section className="results">
          <ul>
            { results && renderResults(results) }
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App;
