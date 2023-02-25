import {templates, select} from '../settings.js';
import utils from '../utils.js';

class Homepage {
  constructor(data) {
    const thisHomepage = this;
    
    thisHomepage.data = data;
    console.log('homepage data', thisHomepage.data);
     
    thisHomepage.renderDOM();
    thisHomepage.initActions();
  }
  renderDOM() {
    const thisHomepage = this;
    
    const generateHTML = templates.homepage(thisHomepage.data);
    console.log('generateHTML', generateHTML);
    
    const homepageWrapper = document.querySelector(select.containerOf.homepage);

    homepageWrapper.appendChild(utils.createDOMFromHTML(generateHTML));        
  }
  initActions() {
  } 
}

export default Homepage;