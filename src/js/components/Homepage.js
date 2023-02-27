import {templates, select} from '../settings.js';
import utils from '../utils.js';

class Homepage {
  constructor(data) {
    const thisHomepage = this;
    
    thisHomepage.data = data;
    // console.log('homepage data', thisHomepage.data);
     
    thisHomepage.renderDOM();
    thisHomepage.initActions();
  }
  renderDOM() {
    const thisHomepage = this;
    
    const generateHTML = templates.homepage(thisHomepage.data);
    
    const homepageWrapper = document.querySelector(select.containerOf.homepage);

    homepageWrapper.appendChild(utils.createDOMFromHTML(generateHTML));        
  }
  initActions() {
    // const thisHomepage = this;
    
    // const button = document.querySelector(select.homepage.orderButton);
    // button.addEventListener('click', function(event) {
    //   event.preventDefault();
    //   thisHomepage.order();
    // });
    let elem = document.querySelector('.main-carousel');
    
    // eslint-disable-next-line no-unused-vars, no-undef
    let flkty = new Flickity( elem, {
      // options
      autoPlay: 3500,
      contain: true,
      wrapAround: true,
      prevNextButtons: false,
      pauseAutoPlayOnHover: false,
    });
  } 
}

export default Homepage;