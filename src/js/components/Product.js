//  renders products in DOM, Processes user's selection of products/toppings
import {templates, select, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    // console.log('new Product: ', thisProduct);
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);
      
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
      

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
      
    /* [DONE] find the clickable trigger (the element that should react to clicking) */
      
    /* [DONE] START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      
      /* [DONE] prevent default action for event */
      event.preventDefault();
      /* [DONE] find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
        
      /* [DONE] if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* [DONE] toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });  
  } 
  initOrderForm(){
    const thisProduct  = this;
    // console.log('initOrderForm: ');
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', () => {
      thisProduct.processOrder();
    });
  }

  processOrder(){
    const thisProduct = this;
    
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    
    // set price to default price
    let price = thisProduct.data.price;
    
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //find images array in data source


        
        
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        // find image by class paramId-optionId
        const optionImg = document.querySelector(`.${paramId}-${optionId}`);
    
        // console.log(optionImg);
        // if there is an image for this ingredient in data source
        if(optionImg){
          // if ingredient is selected show image
          if(optionSelected){
            optionImg.classList.add(classNames.menuProduct.imageVisible);
            // else hide image.
          } else {
            optionImg.classList.remove(classNames.menuProduct.imageVisible);
          }
          // else no image in data source
        } else {
          // console.log('no corresponding image');
        }

          
        // check if optionId of paramId - any topping, crust, sauce  - is selected in formData
        if(optionSelected){
          // if option selected is not default, add price
          if(!option.default){
            price += option.price;
          }
        }    
        // if option selected is  default and unselected lower price
        else {
          if(option.default){
            price -= option.price;
          }}
      }
    }
    thisProduct.priceSingle = price;

    //  multiply price by amount 
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }
  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }
  prepareCartProductParams(){
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    let params = {};
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {
       
        }
      };
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        // check if optionId of paramId - any topping, crust, sauce  - is selected in formData
        if(optionSelected ){
          params[paramId].options[optionId] = option.label;
        }
      }
    }
      
    return params;
      
  } 
    
  addToCart(){
    const thisProduct = this;
    
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}
export default Product;