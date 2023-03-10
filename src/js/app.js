import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Homepage from './components/Homepage.js';

const app = {
  initHome: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.homepage;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data.homepage = parsedResponse;
        // console.log('thisApp.data.homepage', thisApp.data.homepage);
        new Homepage(thisApp.data.homepage);
      });
  },  
  initBooking: function() {
    const thisApp = this;

    thisApp.bookingContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(thisApp.bookingContainer);
  },
  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    
    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', (event)=>{

        const clickedElement = event.target;
        event.preventDefault();

        // get page ID from href attr.
        const id = clickedElement.getAttribute('href').replace('#', '');

        // run thisApp.activatePage() with ID
        thisApp.activatePage(id);

        // change URL hash, add / to prevent scrolling to #

        window.location.hash = '#/' + id;

      });
    }

  },

  activatePage: function(pageId){
    const thisApp = this;

    /* add class 'active' to matching PAGES, remove from non-matching */
    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class 'active' to matching LINKS, remove from non-matching */
    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initMenu: function(){
    const thisApp = this;
    // console.log('thisApp.data: ', thisApp.data);
      
    for(let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        
    }
  },

  initData: function() {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        // console.log('parsedResponse', parsedResponse);
        //  save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;

        //  execute initMenu
        app.initMenu();
      });
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
  },
};

app.init();