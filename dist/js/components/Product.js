import { select, templates, classNames } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.rednerInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  rednerInMenu(){
    const thisProduct = this;
    // Generate HTML
    const generatedHTML = templates.menuProduct(thisProduct.data);
    // Create element using utilis
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    // Find menu container
    const menuContainer = document.querySelector(select.containerOf.menu);
    // Add element to menu
    menuContainer.appendChild(thisProduct.element);
  }
  render(){
    const thisProduct = this;
    // Generate HTML
    const generatedHTML = templates.menuProduct(thisProduct.data);
    // Create element using utilis
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    generatedDOM.classList.add(classNames.menuProduct.wrapperActive);
    thisProduct.element.insertAdjacentElement('afterend',generatedDOM);
    thisProduct.element.remove();
    thisProduct.element = generatedDOM;

    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  getElements(){
    const thisProduct = this;
    thisProduct.dom = {};
    thisProduct.dom.AccordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.forminputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidget = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidget);
    thisProduct.dom.amountWidget.addEventListener('updated', () =>{
      thisProduct.processOrder();
    })
  }

  initAccordion(){
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.AccordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && thisProduct.element != activeProduct){
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        thisProduct.element.classList.add(classNames.menuProduct.wrapperActive);
      } else {
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
    });
  }

  initOrderForm (){
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.dom.forminputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
  
    // set price to default price
    let price = thisProduct.data.price;
  
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        let optionImage = thisProduct.dom.imageWrapper.querySelector('[class~="' + paramId + '-' + optionId + '"]');
        if(optionImage && !formData[paramId].includes(optionId)){
          optionImage.classList.remove(classNames.menuProduct.imageVisible);
        } else if(optionImage && formData[paramId].includes(optionId)){
          optionImage.classList.add(classNames.menuProduct.imageVisible);
        }
        if(!option.default && formData[paramId].includes(optionId)){
          price += option.price;
        } else if(option.default && !formData[paramId].includes(optionId)){
          price -= option.price;
        }
      }
    }
    // multiple by amount
    price *= thisProduct.amountWidget.value;
    thisProduct.priceSingle = thisProduct.data.price;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  addToCart(){
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        Product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);

    thisProduct.render();
  }
  prepareCartProduct(){
    const thisProduct = this;
    
    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * productSummary.amount;
    productSummary.params = thisProduct.prepareCartProductParams();
    return productSummary;
  }
  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const params = {};  
    
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {}
      }
      for(let optionId in param.options) {
        const option = param.options[optionId];
        
        const optionSelected =  formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected){
          params[paramId].options[optionId] = option.label;
        } 
      }
    }
    return params;
  }
}

export default Product;